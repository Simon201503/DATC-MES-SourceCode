import json
import os
import time
from pathlib import Path

from playwright.sync_api import sync_playwright


def main() -> None:
  base_url = os.environ.get("BASE_URL", "http://localhost:4173/pms/")
  artifacts_dir = Path(os.environ.get("ARTIFACTS_DIR", "/workspace/e2e-artifacts"))
  artifacts_dir.mkdir(parents=True, exist_ok=True)

  results = {
    "base_url": base_url,
    "navigation": {},
    "console": {"errors": [], "warnings": []},
    "network": {"failed_requests": []},
    "screenshots": {},
  }

  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    def on_console(msg):
      entry = {"type": msg.type, "text": msg.text}
      if msg.type == "error":
        results["console"]["errors"].append(entry)
      elif msg.type == "warning":
        results["console"]["warnings"].append(entry)

    def on_request_failed(request):
      failure = request.failure
      results["network"]["failed_requests"].append(
        {
          "url": request.url,
          "method": request.method,
          "resource_type": request.resource_type,
          "failure": failure.get("errorText") if failure else None,
        }
      )

    page.on("console", on_console)
    page.on("requestfailed", on_request_failed)

    t0 = time.perf_counter()
    response = page.goto(base_url, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle")
    t1 = time.perf_counter()

    results["navigation"]["status"] = response.status if response else None
    results["navigation"]["domcontentloaded_to_networkidle_ms"] = round((t1 - t0) * 1000, 2)

    nav_metrics = page.evaluate(
      """() => {
        const nav = performance.getEntriesByType('navigation')[0];
        if (!nav) return null;
        return {
          type: nav.type,
          startTime: nav.startTime,
          domContentLoaded: nav.domContentLoadedEventEnd,
          loadEventEnd: nav.loadEventEnd,
          transferSize: nav.transferSize,
          encodedBodySize: nav.encodedBodySize,
          decodedBodySize: nav.decodedBodySize
        };
      }"""
    )
    results["navigation"]["nav_entry"] = nav_metrics

    login_shot = artifacts_dir / "01-login.png"
    page.screenshot(path=str(login_shot), full_page=True)
    results["screenshots"]["login"] = str(login_shot)

    page.get_by_placeholder("Enter your account ID").fill("admin")
    page.get_by_placeholder("Enter password").fill("")
    page.get_by_role("button", name="Sign In").click()

    page.wait_for_load_state("networkidle")
    page.get_by_text("工艺管理系统工作台").wait_for(timeout=15000)

    dash_shot = artifacts_dir / "02-dashboard.png"
    page.screenshot(path=str(dash_shot), full_page=True)
    results["screenshots"]["dashboard"] = str(dash_shot)

    page.get_by_role("link", name="工艺管理").click()
    page.wait_for_load_state("networkidle")
    process_shot = artifacts_dir / "03-process-list.png"
    page.screenshot(path=str(process_shot), full_page=True)
    results["screenshots"]["process_list"] = str(process_shot)

    page.get_by_role("link", name="生产执行").click()
    page.wait_for_load_state("networkidle")
    tracking_shot = artifacts_dir / "04-tracking-list.png"
    page.screenshot(path=str(tracking_shot), full_page=True)
    results["screenshots"]["tracking_list"] = str(tracking_shot)

    report_path = artifacts_dir / "report.json"
    report_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(str(report_path))

    context.close()
    browser.close()


if __name__ == "__main__":
  main()
