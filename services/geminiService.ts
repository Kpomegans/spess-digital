
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { BotanicalInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BOTANICAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    commonName: { type: Type.STRING },
    scientificName: { type: Type.STRING },
    family: { type: Type.STRING },
    vegetativeApparatus: {
      type: Type.OBJECT,
      properties: {
        root: { type: Type.STRING },
        stem: { type: Type.STRING },
        leaves: { type: Type.STRING }
      },
      required: ["root", "stem", "leaves"]
    },
    reproductiveApparatus: {
      type: Type.OBJECT,
      properties: {
        flower: { type: Type.STRING },
        fruit: { type: Type.STRING },
        inflorescence: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            parts: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["description", "parts"]
        },
        ovary: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            sectionDetails: { type: Type.STRING }
          },
          required: ["description", "sectionDetails"]
        }
      },
      required: ["flower", "fruit", "inflorescence", "ovary"]
    },
    floralFormula: { type: Type.STRING },
    floralDiagramSVG: { type: Type.STRING, description: "Un code SVG stylisé représentant le diagramme floral de l'espèce." },
    inflorescenceSVG: { type: Type.STRING, description: "Un dessin SVG montrant l'inflorescence et ses parties avec légendes." },
    ovarySectionSVG: { type: Type.STRING, description: "Un dessin SVG montrant une coupe longitudinale de l'ovaire avec légendes." }
  },
  required: [
    "commonName", "scientificName", "family", "vegetativeApparatus", 
    "reproductiveApparatus", "floralFormula", "floralDiagramSVG", 
    "inflorescenceSVG", "ovarySectionSVG"
  ]
};

const DISCOVERY_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      scientific: { type: Type.STRING },
      family: { type: Type.STRING },
      description: { type: Type.STRING }
    },
    required: ["name", "scientific", "family", "description"]
  }
};

export async function identifyAndAnalyzePlant(input: string | File): Promise<BotanicalInfo> {
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let contentParts: any[] = [];

  if (typeof input === 'string') {
    contentParts.push({ text: `Analyse cette plante : ${input}. Fournis des détails botaniques complets en français.` });
  } else {
    const base64Data = await fileToBase64(input);
    contentParts.push({
      inlineData: {
        data: base64Data,
        mimeType: input.type
      }
    });
    contentParts.push({ text: "Identifie cette plante et fournis des détails botaniques complets en français (appareil végétatif, reproducteur, diagramme floral, etc.)." });
  }

  const params: GenerateContentParameters = {
    model: 'gemini-3-flash-preview',
    contents: { parts: contentParts },
    config: {
      responseMimeType: "application/json",
      responseSchema: BOTANICAL_SCHEMA,
      systemInstruction: "Tu es Spesflore AI, un expert botaniste mondial. Tu fournis des analyses précises sur l'appareil végétatif (racine, tige, feuilles) et reproducteur (fleur, fruit, inflorescence, ovaire). Tu génères également des schémas SVG propres et pédagogiques pour les diagrammes floraux et les coupes botaniques. Tes SVG doivent avoir une largeur de 400px et une hauteur de 400px, avec des lignes noires sur fond blanc ou transparent, et des légendes textuelles incluses dans le SVG."
    }
  };

  const response = await genAI.models.generateContent(params);
  if (!response.text) {
    throw new Error("Aucune réponse du modèle.");
  }
  
  return JSON.parse(response.text) as BotanicalInfo;
}

export async function generatePlantImage(plantName: string): Promise<string> {
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A high-quality, ultra-realistic macro photographic close-up of the plant: ${plantName}. Professional botanical photography style, natural lighting, soft blurred background. Show the flowers or striking leaves.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
}

export async function getRandomPlants(count: number = 3, existingNames: string[] = []): Promise<any[]> {
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await genAI.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Génère une liste de ${count} plantes intéressantes (fleurs, arbres, plantes tropicales) différentes de : ${existingNames.join(', ')}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: DISCOVERY_SCHEMA,
      systemInstruction: "Tu es un conservateur de jardin botanique. Propose des espèces variées, rares ou communes, avec leur nom commun en français, leur nom scientifique, leur famille et une brève description captivante."
    }
  });

  if (!response.text) return [];
  return JSON.parse(response.text);
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
}
