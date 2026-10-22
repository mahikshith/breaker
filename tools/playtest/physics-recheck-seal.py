from pathlib import Path
import hashlib,json,shutil

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'out/physics-recheck-other'
DEST=ROOT/'docs/validation/physics-recheck/other-levels'
BASE='cdff74b582002029d5e4b2bf3b98099b69f3583ac6ba39efeb994774436a85f7'
FINAL='6b21de2363df6969a4996028ce236488dcd67c22e1a9a48d2b681f75a066c8eb'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads((OUT/p).read_text())

def main():
 DEST.mkdir(parents=True,exist_ok=True)
 reports={'space-baseline.json':'combat/report.json','frost-baseline.json':'frost/report.json','vault-final.json':'vault-final/report.json','starflight.json':'starflight/report.json','carrier-browser-final.json':'carrier-final-corrected/report.json','carrier-before.json':'carrier-focus-before/report.json','carrier-after.json':'carrier-focus-after/report.json','kit-harness-timeout.json':'vault/report.json'}
 data={name:load(path)for name,path in reports.items()}
 assert len(data['space-baseline.json']['cases'])==18 and set(data['space-baseline.json']['builds'].values())=={BASE}
 assert data['frost-baseline.json']['complete'] and data['frost-baseline.json']['sha256']==BASE and len(data['frost-baseline.json']['cases'])==6
 assert data['vault-final.json']['completed'] and data['vault-final.json']['htmlSHA256']==FINAL and len(data['vault-final.json']['cases'])==6
 assert data['starflight.json']['complete'] and data['starflight.json']['sourceStable'] and len(data['starflight.json']['cases'])==6
 assert data['carrier-browser-final.json']['complete'] and data['carrier-browser-final.json']['htmlSHA256']==FINAL and len(data['carrier-browser-final.json']['cases'])==4
 for name in ['space-baseline.json','frost-baseline.json','vault-final.json','starflight.json','carrier-browser-final.json']:
  assert all(not c['errors']for c in data[name]['cases'])
 assert not data['carrier-before.json']['actual'] and data['carrier-before.json']['hpBefore']==data['carrier-before.json']['hpAfter']==2
 assert data['carrier-after.json']['actual'] and data['carrier-after.json']['hpBefore']==2 and data['carrier-after.json']['hpAfter']==1
 assert '# pass 311' in (OUT/'unit.log').read_text() and '# fail 0' in (OUT/'unit.log').read_text()
 assert '# pass 64' in (OUT/'carrier-focused.log').read_text() and '# fail 0' in (OUT/'carrier-focused.log').read_text()
 copied={}
 for name,path in reports.items():
  src=OUT/path;dst=DEST/name;shutil.copy2(src,dst);copied[name]=sha(dst)
 for src,name in [('unit.log','unit-baseline.log'),('carrier-focused.log','carrier-focused.log'),('vault.log','kit-harness-timeout.log'),('carrier-final.log','carrier-harness-preconsume.log')]:
  shutil.copy2(OUT/src,DEST/name);copied[name]=sha(DEST/name)
 screenshots={
  'carrier-ios-baseline.png':'combat/ios-carrier-opening.png',
  'carrier-android-final-focus-staged.png':'carrier-final-corrected/android-focus-after-staged.png',
  'circuit-ios-baseline.png':'combat/ios-circuit-opening.png',
  'circuit-android-baseline.png':'combat/android-circuit-opening.png',
  'forge-ios-baseline.png':'combat/ios-forge-opening.png',
  'forge-android-baseline.png':'combat/android-forge-opening.png',
  'frost-ios-ward-staged.png':'frost/ios-03-ward-held-punch-staged.png',
  'frost-android-contact-staged.png':'frost/android-07-stance1-contact-staged.png',
  'vault-ios-ward-staged.png':'vault-final/ios-easy-ward-held.png',
  'vault-android-cosmic-staged.png':'vault-final/android-easy-cosmic.png',
  'gatebreak-ios-ricochet-staged.png':'starflight/ios-easy-ricochet-staged.png',
  'gatebreak-android-storm-staged.png':'starflight/android-easy-storm-occupied-sweep-staged.png',
 }
 (DEST/'screens').mkdir(exist_ok=True)
 for name,path in screenshots.items():
  shutil.copy2(OUT/path,DEST/'screens'/name);copied['screens/'+name]=sha(DEST/'screens'/name)
 bundle=ROOT/'dist/breach.html';assert sha(bundle)==FINAL
 pin=OUT/'pinned-6b21.html';shutil.copy2(bundle,pin);assert sha(pin)==FINAL
 summary={'date':'2026-10-20','scope':'Existing canonical Carrier, Vault, Circuit, Forge, Frost Warden plus standalone Gatebreak. New Mooncoil and parallel Bellforge/Tidewheel acceptance excluded. Staged physics/resource fixtures are not earned wins. Chromium phone viewports are not physical devices.','baselineSourceCommit':'0bc096a','baselineHTML':BASE,'postFixHTML':FINAL,'pinnedLocalHTML':'out/physics-recheck-other/pinned-6b21.html','finding':{'id':'carrier-focus-laser','severity':'medium','symptom':'Focus-scaled friendly LASER missed a physically crossing active-real fighter.','file':'src/carrier.js','change':'shotHit compensates actor velocity by 1/timeScale, matching Circuit/Forge/Frost. SLOW changes only ball time and is intentionally excluded.','sourceSHA256':sha(ROOT/'src/carrier.js'),'test':'tests/physics-recheck-carrier.test.js','before':'real fighter 2HP remains2 despite correct swept contact','after':'same ray consumes shot and removes exactly1HP; no charge farming'},'checks':{'sourceUnitBaseline':311,'postFixFocusedUnit':64,'baselineSpacePhoneModeCases':18,'baselineFrostPhoneModeCases':6,'finalVaultPhoneModeCases':6,'gatebreakPhoneModeCases':6,'gatebreakPowerKindsPerCase':9,'postFixCarrierFocusCases':4,'pageErrors':0},'sourceAndReportFiles':copied,'limits':['No fresh earned completion, ordinary-only win or human difficulty claim.','No physical-phone performance, native lifecycle or APK test in this audit.','Full reruns of Circuit/Forge/Frost are pinned to the pre-fix CDFF baseline; post-fix6B21 browser proof covers Carrier and Vault.','Vault capture and retreat motion have separate existing receipts; this run freshly tests its contacts, Ward, powers and controls.','Original Kit RAF-poll timeout and Carrier fixture preconsumption are preserved as harness failures, not gameplay failures.','The root-owned new Mooncoil theme bundle will have a different hash and requires its own acceptance.']}
 (DEST/'summary.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'path':str(DEST),'summarySHA256':sha(DEST/'summary.json'),'files':len(copied),'source':summary['finding']['sourceSHA256'],'html':FINAL,'complete':True},indent=2))

if __name__=='__main__':main()
