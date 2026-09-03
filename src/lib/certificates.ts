export type CertificateTest = {
  label: string;
  href: string;
};

export type CertificateLot = {
  name: string;
  tests: CertificateTest[];
  productSlug?: string;
  variantLabel?: string;
};

export const CERTIFICATES: CertificateLot[] = [
  {
    name: "Retatrutide 10mg — blue cap, batch JEEP",
    productSlug: "retatrutide-30mg",
    variantLabel: "10mg",
    tests: [
      { label: "Mass / purity", href: "https://verify.janoshik.com/tests/153777-RT10_SLSRXACR5NPX" },
      { label: "Endotoxin", href: "https://janoshik.com/tests/153778-RT10_FADVC951A41G" },
    ],
  },
  {
    name: "Retatrutide 10mg — white cap, triple group test",
    productSlug: "retatrutide-30mg",
    variantLabel: "10mg",
    tests: [
      { label: "Mass / purity", href: "https://verify.janoshik.com/tests/114507-Retatrutide_10mg_White_cap_TE31GUBWLV2C" },
    ],
  },
  {
    name: "Retatrutide 20mg — purple cap, batch JEEP",
    productSlug: "retatrutide-30mg",
    variantLabel: "20mg",
    tests: [
      { label: "Mass / purity", href: "https://janoshik.com/tests/153779-RT20_ZKQI2GMY58BN" },
      { label: "Endotoxin", href: "https://janoshik.com/tests/153780-RT20_9PYASMXM4W1Z" },
    ],
  },
  {
    name: "Retatrutide 30mg — pink cap, batch JEEP",
    productSlug: "retatrutide-30mg",
    variantLabel: "30mg",
    tests: [
      { label: "Mass / purity", href: "https://verify.janoshik.com/tests/80925-R30_8YSG7F76GKG2" },
      { label: "Endotoxin", href: "https://verify.janoshik.com/tests/153774-RT30_3W86I4F9SEMI" },
    ],
  },
  {
    name: "Tirzepatide 10mg — yellow cap, batch JEEP",
    productSlug: "tirzepatide-10mg",
    tests: [
      { label: "Mass / purity", href: "https://verify.janoshik.com/tests/153771-TR10_C7KQKE2DWNEL" },
      { label: "Endotoxin", href: "https://janoshik.com/tests/153772-TR10_V64SECCS79JL" },
    ],
  },
  {
    name: "GHK-Cu 50mg — white cap, batch JEEP",
    productSlug: "ghk-cu-50mg",
    tests: [
      { label: "Mass / purity", href: "https://janoshik.com/tests/198338-GHKCU50_7YWYHRHCLAXS" },
      { label: "Endotoxin", href: "https://janoshik.com/tests/198339-GHKCU50_K6K7811N1YSS" },
    ],
  },
  {
    name: "GLOW 70mg — purple cap, batch JEEP",
    productSlug: "glow70",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/108816-GLOW70_ISKMQN1TDGCP" },
    ],
  },
  {
    name: "KLOW 80mg — red cap, batch JEEP",
    productSlug: "klow-80mg",
    tests: [
      { label: "Mass / purity", href: "https://janoshik.com/tests/200491-KLOW80_BBI8X5D2EKTF" },
      { label: "Endotoxin", href: "https://janoshik.com/tests/200492-KLOW80_KB9ZV6RAM99W" },
    ],
  },
  {
    name: "Tesamorelin 10mg — black cap, batch JEEP",
    productSlug: "tesamorelin-10mg-canada",
    tests: [
      { label: "Mass / purity", href: "https://verify.janoshik.com/tests/153787-TESA10_FZ52MTSTUB5J" },
      { label: "Endotoxin", href: "https://verify.janoshik.com/tests/153788-TESA10_1HDFDF14VSD9" },
    ],
  },
  {
    name: "MOTS-C 10mg — pink cap, batch JEEP",
    productSlug: "mots-c-10mg-canada",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/97567-MOTSC_10mg_AQHEE5KR4SPJ" },
    ],
  },
  {
    name: "MOTS-C 40mg — red cap, batch JEEP",
    tests: [
      { label: "Mass / purity", href: "https://janoshik.com/tests/157419-MOTS40_VXJWRYZWM3X2" },
      { label: "Endotoxin", href: "https://janoshik.com/tests/157420-MOTS40_3SCM7SMJKGRV" },
    ],
  },
  {
    name: "BPC-157 10mg — blue cap, batch JEEP",
    productSlug: "bcp-157-10mg",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/105627-BPC10_1KWNMRQ5BUSC" },
    ],
  },
  {
    name: "Ipamorelin 10mg — blue cap, batch JEEP",
    productSlug: "ipamorelin-10mg",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/153789-IPA10_DFCD14XCWEW4" },
    ],
  },
  {
    name: "CJC-195 (no DAC) / Ipamorelin 5mg / 5mg — red cap, batch JEEP",
    productSlug: "cjc-1259-no-dac-ipamorelin-5mg-5mg",
    tests: [
      { label: "Mass", href: "https://verify.janoshik.com/tests/196474-Sample_9_5QBLJTKBEWQR" },
      { label: "Endotoxin", href: "https://verify.janoshik.com/tests/152402-Sample_9_QWMW1C45NBEC" },
    ],
  },
  {
    name: "KPV 10mg — blue cap, batch JEEP",
    productSlug: "kpv-10mg",
    tests: [
      { label: "Mass / purity", href: "https://verify.janoshik.com/tests/153791-KPV_U16HY2YMVBQ1" },
      { label: "Endotoxin", href: "https://verify.janoshik.com/tests/153792-KPV_QVTWP4Z4NTJD" },
    ],
  },
  {
    name: "Cagrilintide 5ml — clear silver cap, batch JEEP",
    productSlug: "cagrilintide-5mg",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/91567-Cagrilintide_5mg_8NTYDAAR1UBZ" },
    ],
  },
  {
    name: "NAD+ 500mg — silver cap, batch JEEP",
    productSlug: "nad-500mg-canada",
    variantLabel: "500mg",
    tests: [
      { label: "Mass / purity", href: "https://verify.janoshik.com/tests/148326-NAD500_KK4RKHZWCU4H" },
      { label: "Endotoxin", href: "https://janoshik.com/tests/148327-NAD500_QDNS3D34XSDH" },
    ],
  },
  {
    name: "NAD+ 500mg — blue cap, batch BARN",
    productSlug: "nad-500mg-canada",
    variantLabel: "500mg",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/125482-NAD500_JG92X2QJX12D" },
    ],
  },
  {
    name: "NAD+ 1000mg — gold cap, batch JEEP",
    productSlug: "nad-500mg-canada",
    variantLabel: "1000mg",
    tests: [
      { label: "Mass / purity", href: "https://janoshik.com/tests/157421-NAD1000_46VA2MEPI29X" },
      { label: "Endotoxin", href: "https://janoshik.com/tests/148325-NAD1000_4DJ4PAB9NEXP" },
    ],
  },
  {
    name: "Melanotan II — white cap, batch JEEP",
    productSlug: "melanotan",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/108815-Melanotan_2_10mg_H9FHGPVXCDIE" },
    ],
  },
  {
    name: "BAC water 3ml — white cap, batch JEEP",
    productSlug: "bac-water-3ml",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/108612-Bacteriostatic_Water_3ml_T4XMD1ZUBTYK" },
    ],
  },
  {
    name: "Epithalon 10mg — batch M-0317",
    productSlug: "epithalon-10mg-canada",
    tests: [
      { label: "Janoshik COA", href: "https://janoshik.com/tests/124510-EP_10mg_TS2BTVTXXX2V" },
    ],
  },
  {
    name: "Semax 10mg — blue cap, batch JEEP",
    productSlug: "semax-10mg",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/123504-SX10_6NDZF381YENX" },
    ],
  },
  {
    name: "Selank 10mg — blue cap, batch JEEP",
    productSlug: "selank-10mg",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/123505-SK10_YTP6KTLT9HB8" },
    ],
  },
  {
    name: "BPC-157 / TB-500 5mg / 5mg — batch 107783 HK",
    productSlug: "bpc-157-tb-500-10mg10mg",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/107783-BB10_BPC_5mg_TB_5mg_2KKZUKTPQ1NB" },
    ],
  },
  {
    name: "Kisspeptin 10mg — batch 114478 HK",
    productSlug: "kisspeptin-10mg-canada-peptide",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/114478-Kisspeptin10_10mg_AEH4HUHH1LEU" },
    ],
  },
  {
    name: "LL-37 5mg — batch 121858 HK",
    productSlug: "ll37-5mg",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/121858-LL37_5mg_1PAT3YAR1S1L" },
    ],
  },
  {
    name: "AICAR 50mg — batch 148113 HK",
    productSlug: "aicar-50mg",
    tests: [
      { label: "Janoshik COA", href: "https://verify.janoshik.com/tests/148113-AICAR_50mg_X9TBLHAG1U4K" },
    ],
  },
];

export function certificatesForProduct(
  slug: string,
  variantLabel?: string,
): CertificateLot[] {
  const lots = CERTIFICATES.filter((lot) => lot.productSlug === slug);
  if (!lots.length) return [];
  if (!variantLabel) return lots;
  const sized = lots.filter(
    (lot) => !lot.variantLabel || lot.variantLabel === variantLabel,
  );
  return sized.length ? sized : lots;
}

function primaryTestHref(lot: CertificateLot) {
  const preferred = lot.tests.find((t) =>
    /janoshik coa|mass/i.test(t.label),
  );
  return (preferred ?? lot.tests[0])?.href;
}

/** Janoshik COA URL for a product (and vial size, when known). */
export function primaryCoaHref(slug: string, variantLabel?: string) {
  const lots = certificatesForProduct(slug, variantLabel);
  const href = lots[0] ? primaryTestHref(lots[0]) : undefined;
  return href ?? null;
}
