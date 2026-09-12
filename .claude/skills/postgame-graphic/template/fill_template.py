"""
Fill template.html's placeholder tokens for one postgame graphic.

This is the substitution step referenced by template.html: it takes the
8 real inputs (opponent name, opponent level, both scores, opponent logo
filename, game photo filename, top/bottom result lines) and derives the
two things that should never be typed by hand:

  - __WOLFPACK_WIN_CLASS__ : "win" iff wolfpack_score > opponent_score,
    else "". Never applied to the opponent's box, and never applied on
    a tie, per house rule.
  - __OPPONENT_TAG__       : opponent name + level joined for the small
    caption under the score box (not a separate editable field).

Usage:
    python3 fill_template.py data.json output.html

Where data.json has keys: opponent_name, opponent_level, wolfpack_score,
opponent_score, opponent_logo, game_photo, top_result_line, bottom_result_line.
opponent_level may be "" or omitted for opponents with no level to show.
"""
import json
import re
import sys
import os

TEMPLATE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "template.html")


def fill_template(template_path, output_path, *, opponent_name, wolfpack_score,
                   opponent_score, opponent_logo, game_photo, top_result_line,
                   bottom_result_line, opponent_level=""):
    html = open(template_path, encoding="utf-8").read()

    wolfpack_score = int(wolfpack_score)
    opponent_score = int(opponent_score)
    win_class = "win" if wolfpack_score > opponent_score else ""

    opponent_name = opponent_name.strip()
    opponent_level = (opponent_level or "").strip()
    opponent_tag = opponent_name if not opponent_level else f"{opponent_name} {opponent_level}"

    replacements = {
        "__OPPONENT_NAME__": opponent_name,
        "__OPPONENT_LEVEL__": opponent_level,
        "__OPPONENT_TAG__": opponent_tag,
        "__WOLFPACK_SCORE__": str(wolfpack_score),
        "__OPPONENT_SCORE__": str(opponent_score),
        "__OPPONENT_LOGO__": opponent_logo,
        "__GAME_PHOTO__": game_photo,
        "__TOP_RESULT_LINE__": top_result_line,
        "__BOTTOM_RESULT_LINE__": bottom_result_line,
        "__WOLFPACK_WIN_CLASS__": win_class,
    }
    for token, value in replacements.items():
        html = html.replace(token, value)

    # Belt-and-suspenders alongside the in-page JS hide: if no level was
    # supplied, drop the now-empty line from the static HTML too.
    if not opponent_level:
        html = re.sub(r'\s*<div class="cyc" id="cycLine"></div>\n', "\n", html)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    return {"win_class": win_class or "(none)", "opponent_tag": opponent_tag}


if __name__ == "__main__":
    data_path, output_path = sys.argv[1], sys.argv[2]
    with open(data_path, encoding="utf-8") as f:
        data = json.load(f)
    result = fill_template(TEMPLATE_PATH, output_path, **data)
    print(json.dumps(result, indent=2))
