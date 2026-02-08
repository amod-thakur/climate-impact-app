# Custom ROM for OnePlus 5 — Implementation Plan

## Feasibility

**Yes — the OnePlus 5 (codename "cheeseburger") is one of the best-supported devices for custom ROM development.**

- Unlockable bootloader (officially supported by OnePlus)
- Full kernel source available (MSM8998, Linux 4.4.302+)
- Mainline Linux device tree in torvalds/linux
- Active community — LineageOS 22 (Android 15) official builds still produced in 2025/2026
- Qualcomm Snapdragon 835 with extensive CAF support

---

## Phase 0: Prerequisites & Environment Setup

| Item | Details |
|------|---------|
| **Hardware** | Linux PC with 64+ GB RAM, 500+ GB SSD storage |
| **OS** | Ubuntu 20.04/22.04 LTS (recommended) |
| **Device** | OnePlus 5 with USB cable, charged battery |
| **Skills needed** | Linux CLI, Git basics, basic C/Makefile knowledge |
| **Network** | Fast internet (source download is ~100 GB) |

### Steps

1. Install build dependencies (openjdk, python3, git, make, ccache, adb, fastboot, etc.)
2. Install Google's `repo` tool for managing multi-repo AOSP projects
3. Set up `ccache` (compiler cache) to speed up rebuilds
4. Allocate swap/ZRAM if RAM is under 64 GB

---

## Phase 1: Choose Your Base

| Base | Pros | Cons |
|------|------|------|
| **AOSP (pure)** | Full control, no extra layers | Most work; must add all device support yourself |
| **LineageOS** | Already has OnePlus 5 device tree, active community | Less "from scratch" feel |
| **CAF (Code Aurora)** | Optimized Qualcomm code for MSM8998 | More complex to integrate |

**Recommendation:** Start with LineageOS. CyanogenMod became LineageOS — this is the spiritual successor. You get a working OnePlus 5 build out of the box, then customize from there.

---

## Phase 2: Source Code Acquisition

1. Initialize the repo manifest:
   ```
   repo init -u https://github.com/LineageOS/android.git -b lineage-22.0 --git-lfs
   ```

2. Sync the full source tree (~100 GB):
   ```
   repo sync -c -j8 --force-sync --no-tags
   ```

3. Obtain device-specific repos:
   - **Device tree:** `android_device_oneplus_msm8998-common` + `android_device_oneplus_cheeseburger`
   - **Kernel:** `android_kernel_oneplus_msm8998` (Linux 4.4.302+)
   - **Vendor blobs:** `android_vendor_oneplus_msm8998-common` (proprietary binaries)

4. Extract proprietary blobs from a running OnePlus 5 or existing LineageOS zip using `extract-files.sh`

---

## Phase 3: Device Bring-Up (First Boot)

1. Configure the build environment:
   ```
   source build/envsetup.sh
   lunch lineage_cheeseburger-userdebug
   ```

2. Build the ROM:
   ```
   m -j$(nproc)
   ```

3. Unlock the bootloader on the phone:
   - Enable OEM Unlocking in Developer Options
   - `adb reboot bootloader`
   - `fastboot oem unlock`

4. Flash a custom recovery (TWRP or LineageOS Recovery)

5. Flash the built zip and verify it boots

---

## Phase 4: Customization

### 4a. Branding & Theming
- Custom boot animation (replace `bootanimation.zip`)
- Custom default wallpapers (`frameworks/base/core/res/`)
- ROM name, version string, about screen (`vendor/lineage/config/common.mk`)
- Custom ringtones/notification sounds

### 4b. System UI Modifications
- Status bar customizations (clock, icons, battery indicator)
- Quick Settings tile additions
- Navigation bar tweaks
- Lock screen modifications
- Source location: `frameworks/base/packages/SystemUI/`

### 4c. Performance Tuning
- Kernel config (`arch/arm64/configs/lineageos_cheeseburger_defconfig`)
- CPU governor tuning (schedutil, interactive)
- I/O scheduler selection
- Memory management tweaks (LMK, zRAM)
- Clang/LTO build optimizations

### 4d. Feature Additions
- Built-in ad blocking (hosts file or DNS-level)
- Privacy enhancements (permission manager, mic/camera indicators)
- Customizable app launcher
- Theme engine / per-app theming
- OTA update server

### 4e. Pre-installed Apps
- Select AOSP apps to include/exclude
- Add custom apps in `vendor/yourrom/prebuilt/`
- Optionally include OpenGApps or MicroG

---

## Phase 5: Kernel Customization (Advanced)

- Fork `android_kernel_oneplus_msm8998`
- Add/remove kernel modules (WireGuard, custom filesystems)
- Tune scheduler for Snapdragon 835 big.LITTLE architecture
- Overclock/undervolt profiles
- Custom kernel name in Settings > About

---

## Phase 6: Testing & Quality Assurance

| Test Area | What to Verify |
|-----------|---------------|
| Boot | Clean boot, no bootloops, correct boot animation |
| Telephony | Calls, SMS, mobile data, VoLTE |
| WiFi/BT | Connection stability, BT audio, file transfer |
| Camera | Front/rear, video recording, HDR |
| GPS | Lock time, accuracy |
| Audio | Speaker, headphone jack, BT audio routing |
| Sensors | Fingerprint, accelerometer, gyroscope, proximity |
| Battery | Drain rate, Dash Charge / fast charging |
| OTA | Update mechanism |

---

## Phase 7: Distribution & Community

1. Set up an OTA server for seamless updates
2. Create a thread on XDA Forums (OnePlus 5 ROMs section)
3. Host builds on SourceForge, GitHub Releases, or own server
4. Publish source code on GitHub (required by GPL for kernel)
5. Set up a bug tracker (GitHub Issues)
6. Create a Telegram group for community support

---

## Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 32 GB | 64 GB |
| Storage | 300 GB | 500 GB SSD |
| Source download | ~100 GB | ~100 GB |

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Bricking the device | Keep stock OxygenOS backup; TWRP nandroid backups |
| Proprietary blob incompatibility | Use blobs from matching firmware version |
| GPS/camera regressions | Test early, compare against known-good LineageOS builds |
| Security vulnerabilities | Merge monthly AOSP security patches |
| Scope creep | Start with LineageOS base, customize incrementally |

---

## Key Resources

- [LineageOS OnePlus 5 Wiki](https://wiki.lineageos.org/devices/cheeseburger/)
- [LineageOS Build Guide](https://wiki.lineageos.org/devices/cheeseburger/build/)
- [AOSP Build Docs](https://source.android.com/docs/setup/build/building)
- [XDA Forums — OnePlus 5 Development](https://xdaforums.com/f/oneplus-5-roms-kernels-recoveries-other-devel.6483/)
- [Mainline Linux DTS for OnePlus 5](https://github.com/torvalds/linux/blob/master/arch/arm64/boot/dts/qcom/msm8998-oneplus-cheeseburger.dts)
- [LineageOS Kernel Source (MSM8998)](https://github.com/lineageos/android_kernel_oneplus_msm8998)
