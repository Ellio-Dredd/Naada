#!/usr/bin/env python3
"""
Naada (නාද) - Automated Song Ingestion & Seeding Pipeline
Scales catalog from raw chord text / HTML scraping into structured ChordPro & Supabase.
"""

import os
import sys
import time
import glob
import json
import argparse
from pathlib import Path
from typing import Optional, List


# Ensure UTF-8 stdout/stderr on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from slugify import slugify
from pydantic import BaseModel, Field


# Try loading .env.local or .env
try:
    from dotenv import load_dotenv
    env_local = Path(__file__).resolve().parent / ".env.local"
    env_default = Path(__file__).resolve().parent / ".env"
    if env_local.exists():
        load_dotenv(env_local)
    elif env_default.exists():
        load_dotenv(env_default)
except ImportError:
    pass

import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

# 1. Environment & Credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or "https://zkvgmdzqzcavubksubpc.supabase.co"
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY") 
    or os.environ.get("SUPABASE_KEY") 
    or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    or "sb_publishable_sh9Kv6-9rlFLqifxQuGAfw__5ElQNrg"
)
GEMINI_API_KEY = (os.environ.get("GEMINI_API_KEY") or "").strip()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)



# 2. Strict Schema matching Supabase Songs Table
class SongSchema(BaseModel):
    title_si: str = Field(description="Title in Sinhala unicode, e.g. 'මල් පවනැල්ලේ' or 'දිල්හානි'")
    title_en: str = Field(description="Title in English/Singlish, e.g. 'Dilhani' or 'Mal Pawanalle'")
    artist: str = Field(description="Artist Name, e.g. 'Clarence Wijewardena' or 'Milton Mallawarachchi'")
    key: str = Field(description="Root key, e.g. 'C', 'G', 'Am', 'Dm', 'F', 'D'")
    tempo_bpm: int = Field(description="Estimated tempo BPM between 55 and 160")
    time_signature: str = Field(description="e.g. '4/4', '6/8', '3/4'")
    strum_pattern: str = Field(description="Must be strictly one of: 'baila_6_8', 'pop_4_4', 'sarala_3_4', 'calypso_4_4'")
    tags: List[str] = Field(description="Array of 2-4 tags e.g. ['Baila', 'Golden 70s', 'Clarence']")
    content_chordpro: str = Field(description="Strict ChordPro format: [G]දිල්හානි දුවේ [C]ඔබේ සිනාවේ...")
    content_singlish: str = Field(description="Strict ChordPro format in Romanized Singlish: [G]Dilhani duwe [C]obe sinawe...")

# 3. AI Normalization with Gemini
_ai_client = None

def get_ai_client():
    global _ai_client
    if _ai_client is None:
        if not GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is not set. Please set GEMINI_API_KEY in your environment or .env.local "
                "to use automated LLM normalization."
            )
        from google import genai
        _ai_client = genai.Client(api_key=GEMINI_API_KEY)
    return _ai_client


def normalize_song_with_ai(raw_text: str) -> dict:
    from google.genai import types

    ai_client = get_ai_client()

    prompt = f"""
You are an expert music archivist and transcriptionist specializing in Sri Lankan Sinhala music and guitar tabs.
Convert the following raw song data into structured ChordPro format.

Rules:
1. Embed chords inline inside square brackets right before the target syllable (e.g. `[G]මල් [C]පිපීලා`).
2. Do NOT leave floating chords on lines above lyrics.
3. Ensure `content_singlish` mirrors `content_chordpro` line-by-line in clean romanized Sinhala phonetics.
4. Set strum_pattern strictly to one of:
   - 'baila_6_8': Fast 6/8 rhythmic baila (Clarence, Moonstones, baila tracks)
   - 'calypso_4_4': 4/4 syncopated acoustic island calypso
   - 'sarala_3_4': 3/4 waltz / Sarala Gee classical ballads (Kasun Kalhara, Kapuge, Victor)
   - 'pop_4_4': Standard 4/4 pop ballads (Milton Mallawarachchi, Jothipala)
5. Detect the root key accurately (e.g. C, G, Am, Dm, Em, F).
6. Estimate realistic tempo_bpm (between 55 and 160).
7. Generate 2 to 4 accurate tags (e.g. ["Baila", "Golden 70s", "Clarence"] or ["Sarala Gee", "Classics"]).

Raw Song Text:
{raw_text}
"""

    models_to_try = [
        "gemini-3.8-flash",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-flash-latest",
        "gemini-3.5-flash-lite",
    ]
    last_err = None

    for model_name in models_to_try:
        # Retry up to 3 times per model for 503 / 429 temporary demand spikes
        max_retries = 3
        for attempt in range(1, max_retries + 1):
            try:
                response = ai_client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=SongSchema,
                        temperature=0.1,
                    ),
                )
                if response.text:
                    return json.loads(response.text)
            except Exception as e:
                err_str = str(e)
                last_err = e
                # Check for temporary spikes or rate limits
                is_transient = "503" in err_str or "UNAVAILABLE" in err_str or "429" in err_str or "RESOURCE_EXHAUSTED" in err_str
                if is_transient and attempt < max_retries:
                    wait_time = attempt * 3
                    print(f"[{model_name}] Transient error ({e.__class__.__name__}). Retrying in {wait_time}s (attempt {attempt}/{max_retries})...")
                    time.sleep(wait_time)
                    continue
                elif is_transient and attempt == max_retries:
                    print(f"[{model_name}] Exceeded retries due to demand spikes. Falling back to next model...")
                    break
                else:
                    # Non-transient (e.g. 404), fall back to next model immediately
                    break

    raise RuntimeError(f"Gemini normalization failed across all models: {last_err}")

# 4. Ingestion Pipeline
def ingest_song(raw_content: str, dry_run: bool = False) -> Optional[dict]:
    print("Normalizing song with AI...")
    data = normalize_song_with_ai(raw_content)
    song_id = slugify(data["title_en"])

    record = {
        "id": song_id,
        "title_si": data["title_si"],
        "title_en": data["title_en"],
        "artist": data["artist"],
        "key": data["key"],
        "tempo_bpm": data["tempo_bpm"],
        "time_signature": data["time_signature"],
        "strum_pattern": data["strum_pattern"],
        "tags": data["tags"],
        "content_chordpro": data["content_chordpro"],
        "content_singlish": data["content_singlish"]
    }

    if dry_run:
        print(f"[DRY-RUN] Processed: {record['title_en']} ({song_id}) - Key: {record['key']}, Rhythm: {record['strum_pattern']}")
        print(json.dumps(record, indent=2, ensure_ascii=False))
        return record

    res = supabase.table("songs").upsert(record).execute()
    print(f"✓ Successfully ingested into Supabase: {data['title_en']} ({song_id}) [{data['artist']}]")
    return record

# 5. Method A: Process directory of text files
def ingest_directory(dir_path: str = "raw_chords", dry_run: bool = False, limit: Optional[int] = None, skip_existing: bool = True):
    p = Path(dir_path)
    if not p.exists():
        print(f"Directory '{dir_path}' does not exist. Creating it now...")
        p.mkdir(parents=True, exist_ok=True)
        return

    files = sorted(list(p.glob("*.txt")))
    if not files:
        print(f"No .txt files found in '{dir_path}'. Place raw chord files there to ingest.")
        return

    # Cache existing song IDs from DB to avoid wasting API quota
    existing_ids = set()
    if skip_existing and not dry_run:
        try:
            res = supabase.table("songs").select("id").execute()
            if res.data:
                existing_ids = {row["id"] for row in res.data if "id" in row}
                print(f"Found {len(existing_ids)} existing songs in Supabase. Existing songs will be skipped.")
        except Exception as e:
            print(f"Warning: Could not fetch existing song list ({e}). Continuing without skip cache.")

    if limit:
        files = files[:limit]

    print(f"Found {len(files)} song file(s) in '{dir_path}' to process...")
    success_count = 0
    skipped_count = 0
    failed_count = 0

    for i, filepath in enumerate(files, 1):
        filename_slug = slugify(filepath.stem)
        # Check against existing IDs if simple match
        if skip_existing and filename_slug in existing_ids:
            print(f"[{i}/{len(files)}] Skipping already ingested: {filepath.name}")
            skipped_count += 1
            continue

        print(f"\n[{i}/{len(files)}] Processing {filepath.name}...")
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if content:
                    ingest_song(content, dry_run=dry_run)
                    success_count += 1
                    # Free tier pace: 4s delay ensures smooth rate limits (< 15 RPM)
                    if not dry_run:
                        time.sleep(4)
        except Exception as e:
            failed_count += 1
            print(f"✗ Failed processing {filepath.name}: {e}")

    print(f"\nFinished: {success_count} ingested, {skipped_count} skipped, {failed_count} failed out of {len(files)}.")

# 6. Method B: Web Scraping Common Chords Repositories
def scrape_and_ingest(url: str, dry_run: bool = False):
    print(f"Scraping chord repository URL: {url}")
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    res = requests.get(url, headers=headers, timeout=15)
    res.raise_for_status()

    soup = BeautifulSoup(res.text, "html.parser")
    
    # Try finding title
    title_el = (
        soup.find("h1") 
        or soup.find("h2") 
        or soup.find("div", class_="song-title")
    )
    title = title_el.get_text(strip=True) if title_el else "Unknown Song"

    # Try finding chords container
    content_el = (
        soup.find("pre") 
        or soup.find("div", class_="chord-entry") 
        or soup.find("div", class_="chords")
        or soup.find("div", id="song-content")
    )
    content = content_el.get_text() if content_el else ""

    if not content:
        # Fallback to body text or pre
        raise ValueError(f"Could not locate chord pre/container on {url}")

    raw_payload = f"Title: {title}\n\n{content}"
    print(f"Extracted title: {title}, payload length: {len(raw_payload)} chars")
    return ingest_song(raw_payload, dry_run=dry_run)

# CLI Interface
def main():
    parser = argparse.ArgumentParser(description="Naada (නාද) Chord Seeding & Ingestion CLI")
    parser.add_argument("--dir", default=None, help="Directory containing .txt raw chords (default: raw_chords)")
    parser.add_argument("--file", default=None, help="Single raw chord file to ingest")
    parser.add_argument("--url", default=None, help="URL of online Sinhala chords repository to scrape and ingest")
    parser.add_argument("--urls-file", default=None, help="File containing list of URLs to scrape and ingest (one per line)")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of songs to ingest (e.g. --limit 5)")
    parser.add_argument("--no-skip-existing", action="store_true", help="Do not skip songs already in database")
    parser.add_argument("--dry-run", action="store_true", help="Normalize and print JSON without writing to Supabase")
    args = parser.parse_args()

    print("=" * 60)
    print("Naada (නාද) Song Seeding & Ingestion Pipeline")
    print(f"Supabase Endpoint: {SUPABASE_URL}")
    print(f"Gemini API Configured: {'Yes' if GEMINI_API_KEY else 'No (set GEMINI_API_KEY in .env.local)'}")
    print("=" * 60)

    if args.url:
        scrape_and_ingest(args.url, dry_run=args.dry_run)
    elif args.urls_file:
        with open(args.urls_file, "r", encoding="utf-8") as uf:
            urls = [line.strip() for line in uf if line.strip() and not line.strip().startswith("#")]
        print(f"Loaded {len(urls)} URL(s) from {args.urls_file}...")
        for i, u in enumerate(urls, 1):
            print(f"\n[{i}/{len(urls)}] Processing {u}...")
            try:
                scrape_and_ingest(u, dry_run=args.dry_run)
                if not args.dry_run:
                    time.sleep(3)
            except Exception as e:
                print(f"✗ Failed {u}: {e}")
    elif args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            ingest_song(f.read(), dry_run=args.dry_run)
    else:
        target_dir = args.dir if args.dir else "raw_chords"
        skip_existing = not args.no_skip_existing
        ingest_directory(target_dir, dry_run=args.dry_run, limit=args.limit, skip_existing=skip_existing)


if __name__ == "__main__":
    main()
