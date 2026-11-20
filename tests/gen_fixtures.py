"""Sinh dữ liệu đối chiếu từ script Python gốc (ziwei_cli.py).

Dùng: python tests/gen_fixtures.py <đường_dẫn_tới>/ziwei-doushu/scripts <số_ca> <file_ra>
"""
import json, random, sys
sys.path.insert(0, sys.argv[1])
from ziwei_cli import build_output  # noqa: E402
from lunar_python import LunarYear  # noqa: E402

N, OUT = int(sys.argv[2]), sys.argv[3]
rnd = random.Random(20261120)
cases = []

def keep(o):
    if "error" in o:
        return {"error": True}
    c = dict(o["chart"]); c.pop("star_index", None); c.pop("self_check", None)
    r = {"calendar": o["calendar"], "chart": c, "n_warnings": len(o["warnings"])}
    if "horoscope" in o:
        r["horoscope"] = o["horoscope"]
    return r

while len(cases) < N:
    kind = rnd.random()
    p = {"gender": rnd.choice(["男", "女"]), "query_year": rnd.randint(1950, 2080)}
    if kind < 0.6:
        y, m = rnd.randint(1901, 2099), rnd.randint(1, 12)
        d = rnd.randint(1, 28)
        p.update(calendar_type="solar", birth_time=f"{y}-{m:02d}-{d:02d} {rnd.randint(0,23):02d}:{rnd.randint(0,59):02d}")
        p["late_zi_rule"] = rnd.choice(["next_day", "same_day"])
    else:
        y = rnd.randint(1901, 2099)
        leap = LunarYear.fromYear(y).getLeapMonth()
        is_leap = bool(leap) and rnd.random() < 0.6
        m = leap if is_leap else rnd.randint(1, 12)
        p.update(calendar_type="lunar", birth_time=f"{y}-{m:02d}-{rnd.randint(1,29):02d} {rnd.randint(0,23):02d}:{rnd.randint(0,59):02d}",
                 is_leap_month=is_leap, leap_month_rule=rnd.choice([None, "current", "next", "split_15"]))
        if p["leap_month_rule"] is None:
            del p["leap_month_rule"]
    try:
        out = build_output(p)
    except Exception:
        out = {"error": True}
    cases.append({"input": p, "expected": keep(out)})

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(cases, f, ensure_ascii=False, separators=(",", ":"))
print("wrote", len(cases))
