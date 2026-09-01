#!/usr/bin/env python3
import urllib.request
import json
import datetime
import math

req = urllib.request.Request('https://api.mfapi.in/mf/122639', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=12) as r:
    raw = json.loads(r.read().decode('utf-8'))

data = raw.get('data', [])
points = []
for item in data:
    try:
        d = datetime.datetime.strptime(item['date'], '%d-%m-%Y').date()
        nav = float(item['nav'])
        if nav > 0:
            points.append((d, nav))
    except Exception:
        continue
points.sort(key=lambda x: x[0])

latest_dt, latest_nav = points[-1]
print(f"Fund: {raw['meta']['scheme_name']}")
print(f"Total Daily Records: {len(points)}")
print(f"Period: {points[0][0]} to {latest_dt}")

def get_nav_closest_to(target_dt):
    for dt, nav in reversed(points):
        if dt <= target_dt:
            return dt, nav
    return None, None

def calc_exact_cagr(years):
    target = latest_dt - datetime.timedelta(days=int(years * 365.25))
    past_dt, past_nav = get_nav_closest_to(target)
    if not past_dt or past_dt < points[0][0]:
        return None, None
    days = (latest_dt - past_dt).days
    if abs(days - (years * 365.25)) > 25:
        return None, None
    cagr = ((latest_nav / past_nav) ** (365.25 / days) - 1.0) * 100.0
    return round(cagr, 2), f"{past_dt} (NAV: {past_nav}) to {latest_dt} (NAV: {latest_nav})"

c1, d1 = calc_exact_cagr(1)
c3, d3 = calc_exact_cagr(3)
c5, d5 = calc_exact_cagr(5)
c10, d10 = calc_exact_cagr(10)

print(f"1Y CAGR: {c1}% [{d1}]")
print(f"3Y CAGR: {c3}% [{d3}]")
print(f"5Y CAGR: {c5}% [{d5}]")
print(f"10Y CAGR: {c10}% [{d10}]")

cutoff_3y = latest_dt - datetime.timedelta(days=int(3 * 365.25))
recent_3y = [p for p in points if p[0] >= cutoff_3y]
daily_rets = []
for i in range(1, len(recent_3y)):
    r = (recent_3y[i][1] - recent_3y[i-1][1]) / recent_3y[i-1][1]
    daily_rets.append(r)

mean_daily = sum(daily_rets) / len(daily_rets)
var_daily = sum((r - mean_daily)**2 for r in daily_rets) / (len(daily_rets) - 1)
daily_std = math.sqrt(var_daily)
ann_vol = round(daily_std * math.sqrt(252) * 100.0, 2)
sharpe = round((c3 - 6.8) / ann_vol, 2) if c3 else None

daily_mar = 0.068 / 252.0
downside_sq = [ (r - daily_mar)**2 for r in daily_rets if r < daily_mar ]
downside_dev = math.sqrt(sum(downside_sq) / len(daily_rets)) * math.sqrt(252) * 100.0
sortino = round((c3 - 6.8) / downside_dev, 2) if downside_dev > 0 and c3 else None

peak = points[0][1]
max_dd = 0.0
peak_dt = points[0][0]
trough_dt = points[0][0]
cur_peak_dt = points[0][0]
for dt, nav in points:
    if nav > peak:
        peak = nav
        cur_peak_dt = dt
    dd = ((peak - nav) / peak) * 100.0
    if dd > max_dd:
        max_dd = dd
        peak_dt = cur_peak_dt
        trough_dt = dt

print(f"3Y Annualized Volatility: {ann_vol}%")
print(f"3Y Sharpe Ratio (Rf=6.8%): {sharpe}")
print(f"3Y Sortino Ratio (Downside Dev={round(downside_dev, 2)}%): {sortino}")
print(f"All-time Max Drawdown: -{round(max_dd, 2)}% (Peak: {peak_dt} to Trough: {trough_dt})")
