#!/usr/bin/env python3
"""Extract KeeleSepp curriculum prototype content into a browser/Node data module."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from lxml import html


def clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def text(node) -> str:
    return clean(node.text_content()) if node is not None else ""


def first(node, xpath: str):
    values = node.xpath(xpath)
    return values[0] if values else None


def strip_label(value: str, label: str) -> str:
    return clean(re.sub(rf"^{re.escape(label)}\s*:?\s*", "", value, flags=re.I))


def class_xpath(name: str) -> str:
    return f'contains(concat(" ", normalize-space(@class), " "), " {name} ")'


def extract_lesson(node) -> dict:
    number = text(first(node, f'.//*[{class_xpath("lesson-num")}][1]'))
    goal = strip_label(text(first(node, f'.//*[{class_xpath("lesson-goal")}][1]')), "Цель")
    steps = []
    for step in node.xpath(f'.//div[{class_xpath("lesson-steps")}]/div[{class_xpath("step")}]'):
        title_node = first(step, './/b[1]')
        duration_node = first(step, './/b[1]/i[1]')
        duration = text(duration_node).strip("()")
        title_value = text(title_node)
        if duration:
            title_value = clean(title_value.replace(f"({duration})", ""))
        body = [text(item) for item in step.xpath('.//p | .//ul/li') if text(item)]
        steps.append({"title": title_value, "duration": duration, "content": body})

    materials = assessment = age_note = ""
    for item in node.xpath(f'.//div[{class_xpath("lesson-foot")}]/div[{class_xpath("foot-item")}]'):
        value = text(item)
        classes = set(clean(item.get("class")).split())
        if "assess" in classes:
            assessment = strip_label(value, "Оценить")
        elif "age" in classes:
            age_note = strip_label(value, "Возраст")
        else:
            materials = strip_label(value, "Материалы")

    return {
        "number": number,
        "goal": goal,
        "steps": steps,
        "materials": materials,
        "assessment": assessment,
        "ageNote": age_note,
    }


def extract_topic(node, language: str, level_code: str, index: int) -> dict:
    vocab = []
    for chip in node.xpath(f'.//*[{class_xpath("vocab-chip")}]'):
        anchor = first(chip, './/a[1]')
        translation = text(first(chip, f'.//*[{class_xpath("vc-tr")}][1]')).lstrip("—–- ")
        vocab.append({
            "word": text(anchor),
            "translation": translation,
            "dictionaryUrl": anchor.get("href") if anchor is not None else "",
        })
    lessons = [extract_lesson(item) for item in node.xpath(f'./div[{class_xpath("lesson-card")}]')]
    if not lessons:
        lessons = [extract_lesson(item) for item in node.xpath(f'.//div[{class_xpath("lesson-card")}]')]
    return {
        "id": f"{language}-{level_code.lower()}-{index + 1:02d}",
        "name": clean(node.get("data-topic")),
        "iconKey": clean(node.get("data-icon")) or "global",
        "lessons": lessons,
        "vocab": vocab,
    }


def extract_level(node, language: str) -> dict:
    level_name = text(first(node, f'.//*[{class_xpath("lvl-name")}][1]'))
    level_code = level_name.split("—", 1)[0].strip()
    stats = []
    for item in node.xpath(f'.//div[{class_xpath("stat-row")}]/div[{class_xpath("stat")}]'):
        stats.append({
            "label": text(first(item, f'.//*[{class_xpath("k")}][1]')),
            "value": text(first(item, f'.//*[{class_xpath("v")}][1]')),
        })
    sections = []
    for block in node.xpath(f'.//div[{class_xpath("grid2")}]/div[{class_xpath("block")}]')[:2]:
        sections.append({
            "title": text(first(block, './/h4[1]')),
            "items": [text(item) for item in block.xpath('.//li') if text(item)],
        })
    topics = [
        extract_topic(topic, language, level_code, index)
        for index, topic in enumerate(node.xpath(f'.//div[{class_xpath("topic-detail")}]'))
    ]
    school_box = first(node, f'.//div[{class_xpath("school-box")}][1]')
    exam_box = first(node, f'.//div[{class_xpath("exam-box")}][1]')
    return {
        "code": level_code,
        "name": level_name,
        "gradeTag": text(first(node, f'.//*[{class_xpath("grade-tag")}][1]')),
        "description": text(first(node, f'.//*[{class_xpath("lvl-desc")}][1]')),
        "stats": stats,
        "sections": sections,
        "schoolAlignment": text(first(school_box, './/p[1]')) if school_box is not None else "",
        "examAlignment": text(first(exam_box, './/p[1]')) if exam_box is not None else "",
        "topics": topics,
    }


def extract(source: Path) -> dict:
    document = html.parse(str(source))
    languages = []
    for language, title in (("est", "Eesti keel"), ("eng", "English")):
        panel = first(document, f'//*[@id="panel-{language}"]')
        levels = [extract_level(item, language) for item in panel.xpath(f'.//div[{class_xpath("level")}]')]
        languages.append({"id": language, "title": title, "levels": levels})
    topic_count = sum(len(level["topics"]) for language in languages for level in language["levels"])
    lesson_count = sum(len(topic["lessons"]) for language in languages for level in language["levels"] for topic in level["topics"])
    word_count = sum(len(topic["vocab"]) for language in languages for level in language["levels"] for topic in level["topics"])
    return {
        "version": "2026-08-29",
        "sourceLanguage": "ru",
        "languages": languages,
        "stats": {
            "levels": sum(len(language["levels"]) for language in languages),
            "topics": topic_count,
            "lessons": lesson_count,
            "vocabulary": word_count,
        },
    }


def render_module(data: dict) -> str:
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return (
        "(function(root,factory){\n"
        "  const data=factory();\n"
        "  if(typeof module==='object'&&module.exports) module.exports=data;\n"
        "  if(root) root.HaldusCurriculum=data;\n"
        f"}})(typeof window!=='undefined'?window:globalThis,function(){{return {payload};}});\n"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    data = extract(args.source)
    args.output.write_text(render_module(data), encoding="utf-8")
    print(json.dumps(data["stats"], ensure_ascii=False))


if __name__ == "__main__":
    main()
