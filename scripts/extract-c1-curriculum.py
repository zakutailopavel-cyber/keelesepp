#!/usr/bin/env python3
"""Extract KeeleSepp C1 roadmap data from the approved DOCX source."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from docx import Document
from docx.document import Document as DocumentType
from docx.table import Table
from docx.text.paragraph import Paragraph


def blocks(document):
    for child in document.element.body.iterchildren():
        if child.tag.endswith("}p"):
            yield Paragraph(child, document)
        elif child.tag.endswith("}tbl"):
            yield Table(child, document)


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def table_values(table: Table) -> dict[str, str]:
    values = {}
    for row in table.rows:
        cells = [clean(cell.text) for cell in row.cells]
        if len(cells) >= 2 and cells[0]:
            values[cells[0]] = cells[1]
    return values


def lesson_kind(type_text: str) -> tuple[str, str]:
    lowered = type_text.lower()
    if "grammatika" in lowered:
        return "grammar", "Grammatika"
    if "progressikontroll" in lowered:
        return "assessment", "Kontroll"
    return "theme", "Teema"


def extract(source: Path) -> dict:
    document: DocumentType = Document(source)
    modules = []
    module = None
    lesson = None

    def finish_lesson():
        nonlocal lesson
        if not lesson:
            return
        missing = [key for key in ("typeText", "focus", "prompt") if not lesson.get(key)]
        if missing:
            raise ValueError(f"Tund {lesson['number']} is missing: {', '.join(missing)}")
        kind, label = lesson_kind(lesson["typeText"])
        lesson["id"] = f"est-c1-{lesson['number']:03d}"
        lesson["sourceKey"] = f"c1-docx:tund-{lesson['number']:03d}"
        lesson["kind"] = kind
        lesson["typeLabel"] = label
        lesson["hours"] = 2
        module["lessons"].append(lesson)
        lesson = None

    for block in blocks(document):
        if isinstance(block, Paragraph):
            text = clean(block.text)
            if not text:
                continue
            module_match = re.fullmatch(r"Moodul\s+(\d+)\.\s+(.+)", text)
            lesson_match = re.fullmatch(r"Tund\s+(\d+)\.\s+(.+)", text)
            if module_match:
                finish_lesson()
                module = {
                    "id": f"est-c1-module-{int(module_match.group(1)):02d}",
                    "number": int(module_match.group(1)),
                    "title": module_match.group(2),
                    "description": "",
                    "independentHours": 4,
                    "lessons": [],
                }
                modules.append(module)
                continue
            if lesson_match and module:
                finish_lesson()
                lesson = {
                    "number": int(lesson_match.group(1)),
                    "title": lesson_match.group(2),
                    "typeText": "",
                    "focus": "",
                    "prompt": "",
                }
                continue
            if module and not lesson and not module["description"] and block.style.name == "Meta":
                module["description"] = text
                continue
            if lesson and block.style.name == "Prompt":
                lesson["prompt"] = text
        elif lesson:
            values = table_values(block)
            if values.get("Tüüp"):
                lesson["typeText"] = values["Tüüp"]
                lesson["focus"] = values.get("Fookus", "")

    finish_lesson()
    lessons = [item for entry in modules for item in entry["lessons"]]
    expected_numbers = list(range(1, 101))
    if [item["number"] for item in lessons] != expected_numbers:
        raise ValueError("DOCX must contain lessons 1 through 100 in exact order")
    if len(modules) != 10 or any(len(entry["lessons"]) != 10 for entry in modules):
        raise ValueError("DOCX must contain 10 modules with 10 lessons each")
    if sum(item["kind"] == "theme" for item in lessons) != 70:
        raise ValueError("DOCX must contain 70 thematic lessons")
    if sum(item["kind"] == "grammar" for item in lessons) != 20:
        raise ValueError("DOCX must contain 20 grammar lessons")
    if sum(item["kind"] == "assessment" for item in lessons) != 10:
        raise ValueError("DOCX must contain 10 progress checks")

    return {
        "id": "est-c1-curriculum-240-v1",
        "version": "2026-09-21.1",
        "title": "KeeleSepp C1 õppekava",
        "subject": "Eesti keel",
        "level": "C1",
        "totalHours": 240,
        "contactHours": 200,
        "independentHours": 40,
        "lessonCount": 100,
        "moduleCount": 10,
        "themeLessonCount": 70,
        "grammarLessonCount": 20,
        "assessmentCount": 10,
        "sourceDocument": source.name,
        "modules": modules,
    }


def write_outputs(curriculum: dict, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    shard_urls = []
    for module in curriculum["modules"]:
        filename = f"keelesepp-c1-curriculum-{module['number']:02d}.json"
        shard_urls.append(f"/data/{filename}")
        payload = {
            "curriculumId": curriculum["id"],
            "version": curriculum["version"],
            "module": module,
        }
        (output_dir / filename).write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
    manifest = {key: value for key, value in curriculum.items() if key != "modules"}
    manifest["shards"] = shard_urls
    (output_dir / "keelesepp-c1-curriculum.json").write_text(
        json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path("data"))
    args = parser.parse_args()
    curriculum = extract(args.source)
    write_outputs(curriculum, args.output_dir)
    print(
        f"Extracted {curriculum['lessonCount']} lessons in {curriculum['moduleCount']} modules "
        f"from {curriculum['sourceDocument']}"
    )


if __name__ == "__main__":
    main()
