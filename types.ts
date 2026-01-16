
export interface VegetativeApparatus {
  root: string;
  stem: string;
  leaves: string;
}

export interface InflorescenceData {
  description: string;
  parts: string[];
}

export interface OvaryData {
  description: string;
  sectionDetails: string;
}

export interface ReproductiveApparatus {
  flower: string;
  fruit: string;
  inflorescence: InflorescenceData;
  ovary: OvaryData;
}

export interface BotanicalInfo {
  commonName: string;
  scientificName: string;
  family: string;
  vegetativeApparatus: VegetativeApparatus;
  reproductiveApparatus: ReproductiveApparatus;
  floralFormula: string;
  floralDiagramSVG: string;
  inflorescenceSVG: string;
  ovarySectionSVG: string;
}

export interface AnalysisResult {
  plantInfo: BotanicalInfo | null;
  loading: boolean;
  error: string | null;
}
