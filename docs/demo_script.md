# Demo Script

Run `make backend` in one terminal and `make mobile` (or `make web`) in another. All six
scenarios below work with zero API keys via the deterministic mock provider. The seeded
demo images live in `backend/data/demo_images/`.

## 1. Router — TP-Link Archer AX55 (red internet light)

1. From the Home screen, tap **Upload from library** (📁) and pick `tp_link_ax55_red_led.png`.
2. Tap **Analyze** on the preview screen.
3. Diagnosis screen shows: category `router`, brand `TP-Link`, model `Archer AX55`,
   risk level **Safe**, and a cited diagnosis about the red Internet LED.
4. Tap **Start guided fix** — steps walk through checking the WAN cable, restarting
   modem/router in order, checking for an ISP outage, each citing the manual section.

## 2. Dishwasher — Bosch E24

1. Upload `bosch_dishwasher_e24.png`.
2. Diagnosis: category `dishwasher`, brand `Bosch`, error code `E24`, risk level **Low
   risk**, with a water/electricity caution warning.
3. Guided fix: clean the accessible filter, check the drain hose, check the air gap —
   all cited to `dishwasher_bosch_e24.md`.

## 3. Washing machine — LG OE

1. Upload `lg_washer_oe.png`.
2. Diagnosis: category `washing_machine`, brand `LG`, error code `OE`.
3. Guided fix: locate/clean the drain filter, check the drain hose, run a confirm cycle —
   cited to `washing_machine_lg_oe.md`.

## 4. Laptop — fan noise / overheating

1. Upload `laptop_fan_noise.png`.
2. Diagnosis: category `laptop`, brand `Lenovo`, problem `overheating_fan_noise`, risk
   level **Safe**/low.
3. Guided fix: clean external vents, check CPU load, ensure vents aren't blocked — with a
   moderate-risk warning surfaced only if internal fan replacement is discussed.

## 5. Dangerous refusal — microwave capacitor

1. Upload `microwave_capacitor_warning.png`.
2. Diagnosis screen shows a red **Professional required** safety badge, `blocked: true`,
   and the refusal message. **No guided-fix steps are shown** — `steps` is empty by
   design (see [SAFETY.md](../SAFETY.md)).

## 6. Bad image — blurry router

1. Upload `blurry_router.png`.
2. The app shows a "retake photo" prompt instead of any diagnosis — the image quality
   check (blur variance) flags it as unusable before any vision/LLM call happens.

## Bonus: typed flow + manual upload

- On the Home screen, tap **Type error code instead** → enter `Bosch`, `E24` → **Get
  diagnosis** to see Flow B without a photo.
- Switch to the **Upload a manual** tab on the same screen to paste a manual and see it
  become an immediately-searchable, priority-ranked source.
