# Optics & transceivers cheatsheet

## Form factors

| Form factor | Max speed | Notes |
|---|---|---|
| SFP | 1G | 1000BASE-T/SX/LX |
| SFP+ | 10G | dominant 10G form |
| SFP28 | 25G | same cage as SFP+ (backward-compatible) |
| SFP56 | 50G | PAM4 |
| QSFP+ | 40G | 4×10G lanes; breakout to 4×SFP+ |
| QSFP28 | 100G | 4×25G; breakout to 4×SFP28 |
| QSFP56 | 200G | 4×50G PAM4 |
| QSFP-DD | 400/800G | 8 lanes; accepts QSFP28/56 modules |
| OSFP | 400/800G | AI/back-end fabrics; more thermal headroom |

## Common Ethernet PMDs & reach

| Optic | Medium | Reach |
|---|---|---|
| 10GBASE-T | Cat6a copper | 100 m (higher power/latency than optics) |
| 10G/25G/100G-**SR** | MMF OM3 / OM4 | 10G: 300/400 m · 25G: 70/100 m · 100G-SR4: 70/100 m |
| 10G/25G/100G-**LR** | SMF OS2 | 10 km |
| **ER** | SMF | 40 km |
| **ZR** | SMF | 80 km |
| 100G-**CWDM4** | SMF duplex | 2 km (cheaper 100G campus link) |
| 100G-**DR/FR/LR** (single-λ PAM4) | SMF | 500 m / 2 km / 10 km |
| **BiDi** | one SMF strand | uses two λ (must pair up/down models) |

- SR4/PSM4 use **MPO-12** connectors; duplex optics use **LC**.
- OM3 = aqua, OM4 = aqua/violet, OS2 = yellow jackets.

## DAC vs AOC vs optics

| Type | Reach | When |
|---|---|---|
| DAC (passive copper) | ≤3–5 m | in-rack; cheapest, lowest power/latency |
| AOC (active optical) | ≤30 m | row-scale; lighter bend-friendly, sealed ends |
| Transceiver + fiber | any | cross-room and beyond; field-repluggable |

- Breakouts: 40G→4×10G, 100G→4×25G (DAC/AOC/fiber) — check the switch supports
  breakout on that port group (often disables neighbors).

## Verify from the switch (EOS)

```bash
show interfaces transceiver            # DDM: temp, Tx/Rx power (dBm), current
show interfaces transceiver detail    # thresholds + alarms
show interfaces e1 phy detail          # link training/PHY state
```

- Healthy Rx is typically **−1 to −9 dBm** (SR/LR); **−30 dBm ≈ no light**
  (dirty/broken fiber, Tx dead, or wrong λ pairing).
- **Clean connectors** before blaming the optic — most "bad optic" tickets are dirt.
- Vendor coding: many platforms accept third-party optics but log warnings;
  keep spares of the exact coded SKU for the platforms that enforce.
