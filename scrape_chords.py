#!/usr/bin/env python3
"""
Naada (නාද) - Sinhala Guitar Chords Web Scraper
Extracts raw chord text, title, and artist from public chord repositories.
Saves clean text files directly into raw_chords/ or pipes them straight into seed_naada.py.
"""

import os
import sys
import re
import argparse
from pathlib import Path
from urllib.parse import urlparse, urljoin

# Ensure UTF-8 stdout/stderr on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import requests
from bs4 import BeautifulSoup, Comment
from slugify import slugify

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,si;q=0.8",
}

def clean_html_soup(soup: BeautifulSoup) -> None:
    """Strip out unwanted script, style, comments, and ad elements."""
    for tag in soup(["script", "style", "nav", "footer", "noscript", "iframe", "svg", "aside"]):
        tag.decompose()
    for tag in soup.find_all(class_=re.compile(r"site-header|\bsidebar-primary\b|\bsidebar-secondary\b|\bwidget\b|comment-respond|comments|menu", re.I)):
        tag.decompose()
    for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
        comment.extract()

def extract_song_from_html(html_text: str, source_url: str = "") -> dict:
    """
    Parses HTML from chord websites and extracts:
    - title
    - artist
    - raw chord/lyrics text
    """
    soup = BeautifulSoup(html_text, "html.parser")

    # 1. Extract Song Title & Artist
    title = ""
    artist = ""

    # Check page <title> tag first (frequently has: Song - Artist - Chords)
    if soup.title and soup.title.string:
        page_title = soup.title.get_text().strip()
        cleaned_title = re.sub(r"[\s\|\-–]+Chords.*$", "", page_title, flags=re.I).strip()
        cleaned_title = re.sub(r"Chords and Lyrics", "", cleaned_title, flags=re.I).strip()
        parts = [p.strip() for p in re.split(r"\s+[-–|]\s+", cleaned_title) if p.strip()]

        if len(parts) >= 3:
            title = f"{parts[0]} ({parts[1]})"
            artist = parts[2]
        elif len(parts) == 2:
            title = parts[0]
            artist = parts[1]
        elif len(parts) == 1:
            title = parts[0]

    # Fallback / Refine Title from H1
    h1 = (
        soup.find("h1", class_=re.compile(r"title|song|entry", re.I))
        or soup.find("h1")
    )
    if h1 and (not title or len(title) > 80):
        raw_h1 = h1.get_text(strip=True)
        raw_h1 = re.sub(r"[\s\|\-–]+Chords.*$", "", raw_h1, flags=re.I)
        raw_h1 = re.sub(r"Chords and Lyrics", "", raw_h1, flags=re.I).strip()
        if " - " in raw_h1 or " – " in raw_h1:
            h1_parts = re.split(r"\s+[-–]\s+", raw_h1, 1)
            title = h1_parts[0].strip()
            if not artist or artist == "Unknown Artist":
                artist = h1_parts[1].strip()
        else:
            title = raw_h1

    # Fallback Artist from Category / Meta / Taxonomies
    if not artist or artist == "Unknown Artist":
        cat_el = (
            soup.find("a", rel=lambda x: x and "category" in x)
            or soup.find(class_=re.compile(r"artist|category-artist|singer", re.I))
            or soup.find("meta", {"name": re.compile(r"author|artist", re.I)})
        )
        if cat_el:
            artist = cat_el.get("content") if cat_el.name == "meta" else cat_el.get_text(strip=True)

    # 2. Extract Chords Container
    # If a <pre> tag is present, that is almost universally the exact chords block
    pre = soup.find("pre")
    if pre and len(pre.get_text().strip()) > 50:
        chords_text = pre.get_text()
    else:
        clean_html_soup(soup)
        candidate_elements = [
            soup.find("div", class_=re.compile(r"chord|tab|lyrics|entry-content|song-content", re.I)),
            soup.find("div", id=re.compile(r"chord|tab|lyrics|song", re.I)),
            soup.find("article"),
            soup.find("main"),
            soup.find("body"),
        ]
        chords_text = ""
        for el in candidate_elements:
            if el:
                text = el.get_text()
                if len(text.strip()) > 80:
                    chords_text = text
                    break

    if not chords_text or len(chords_text.strip()) < 50:
        raise ValueError(f"Could not locate chords block on page: {source_url}")

    # Clean redundant empty lines
    cleaned_lines = []
    prev_empty = False
    for line in chords_text.splitlines():
        line_stripped = line.rstrip()
        if not line_stripped:
            if not prev_empty:
                cleaned_lines.append("")
                prev_empty = True
        else:
            cleaned_lines.append(line_stripped)
            prev_empty = False

    cleaned_content = "\n".join(cleaned_lines).strip()

    return {
        "title": title or "Unknown Title",
        "artist": artist or "Unknown Artist",
        "content": cleaned_content,
        "source_url": source_url,
    }

def scrape_url(url: str) -> dict:
    """Fetches a URL and extracts the song chords."""
    print(f"--> Fetching: {url}")
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    # Try detecting UTF-8 encoding properly
    if resp.encoding != 'utf-8':
        resp.encoding = resp.apparent_encoding or 'utf-8'
    return extract_song_from_html(resp.text, source_url=url)

def save_to_raw_chords(song_data: dict, output_dir: str = "raw_chords") -> Path:
    """Saves the scraped song to raw_chords/<slug>.txt"""
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    slug_base = f"{song_data['artist']}-{song_data['title']}"
    filename = f"{slugify(slug_base)}.txt"
    filepath = out_path / filename

    content_with_header = (
        f"Title: {song_data['title']}\n"
        f"Artist: {song_data['artist']}\n"
        f"Source: {song_data['source_url']}\n\n"
        f"{song_data['content']}\n"
    )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content_with_header)

    print(f"✓ Saved to file: {filepath}")
    return filepath

def crawl_artist_page(artist_url: str) -> list:
    """
    Crawls an artist listing page or index page and discovers individual song chord links.
    """
    print(f"--> Discovering song links on artist page: {artist_url}")
    resp = requests.get(artist_url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    parsed_base = urlparse(artist_url)
    base_domain = f"{parsed_base.scheme}://{parsed_base.netloc}"

    song_links = set()

    # 1. Search inside <article> elements (Genesis / WordPress / custom CMS theme standard)
    for article in soup.find_all("article"):
        for a in article.find_all("a", href=True):
            href = a["href"].strip()
            # If the link is an entry title or inside h1/h2
            if a.parent and a.parent.name in ["h1", "h2", "h3"]:
                full_url = urljoin(base_domain, href)
                song_links.add(full_url)

    # 2. General link filter fallback
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        full_url = urljoin(base_domain, href)

        if parsed_base.netloc in full_url:
            if any(pattern in href.lower() for pattern in ["chord", "song", "lyrics", "tabs", "/track/"]):
                if not any(excluded in href.lower() for excluded in ["tag", "category", "author", "about", "contact", "page", "cart", "product"]):
                    song_links.add(full_url)

    links_list = sorted(list(song_links))
    print(f"Found {len(links_list)} potential song link(s) on artist page.")
    return links_list

def main():
    parser = argparse.ArgumentParser(description="Naada (නාද) Sinhala Chord Web Scraper")
    parser.add_argument("--url", help="Direct URL of a single song chord page to scrape")
    parser.add_argument("--urls-file", help="Path to text file containing list of URLs (one per line)")
    parser.add_argument("--artist-url", help="Artist index page URL to crawl and extract all song links")
    parser.add_argument("--out-dir", default="raw_chords", help="Output directory to save .txt files (default: raw_chords)")
    parser.add_argument("--ingest", action="store_true", help="Immediately run seed_naada.py normalization and insert into Supabase")
    args = parser.parse_args()

    print("=" * 65)
    print("Naada (නාද) Sinhala Chords Web Scraper")
    print("=" * 65)

    urls_to_process = []

    if args.url:
        urls_to_process.append(args.url.strip())
    elif args.urls_file:
        file_path = Path(args.urls_file)
        if not file_path.exists():
            print(f"Error: URLs file '{args.urls_file}' not found.")
            sys.exit(1)
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                u = line.strip()
                if u and not u.startswith("#"):
                    urls_to_process.append(u)
    elif args.artist_url:
        urls_to_process = crawl_artist_page(args.artist_url)
    else:
        parser.print_help()
        sys.exit(0)

    print(f"\nQueue contains {len(urls_to_process)} URL(s) to scrape.\n")

    saved_files = []
    for idx, url in enumerate(urls_to_process, 1):
        print(f"[{idx}/{len(urls_to_process)}] Scraping {url}...")
        try:
            song_data = scrape_url(url)
            print(f"    Extracted: '{song_data['title']}' by {song_data['artist']}")
            filepath = save_to_raw_chords(song_data, output_dir=args.out_dir)
            saved_files.append(filepath)

            # Optional immediate ingestion
            if args.ingest:
                from seed_naada import ingest_song
                with open(filepath, "r", encoding="utf-8") as sf:
                    ingest_song(sf.read())

        except Exception as e:
            print(f"    ✗ Failed to scrape {url}: {e}")

    print("\n" + "=" * 65)
    print(f"Scraping completed! Successfully saved {len(saved_files)} file(s) into '{args.out_dir}/'.")
    if not args.ingest:
        print("\nTo ingest these songs into Supabase using Gemini AI:")
        print("  python seed_naada.py")
    print("=" * 65)

if __name__ == "__main__":
    main()
