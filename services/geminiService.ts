import { GoogleGenAI, Type } from "@google/genai";
import { SceneObject, ObjectType } from "../types";

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generate3DModelFromPrompt = async (prompt: string, currentObjects: SceneObject[]): Promise<{ text: string, objects?: SceneObject[] }> => {
  // Initialize Gemini Client
  // API Key is automatically injected from the environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // System Instruction: Defining the persona and rules for complex model generation
  const systemInstruction = `
  You are a world-class 3D Structure Engineer and Voxel Artist using Three.js logic.
  Your task is to generate HIGHLY DETAILED, COMPLEX 3D models based on user prompts.

  CRITICAL DESIGN RULES:
  1. COMPLEXITY: Do NOT generate simple blocks. Break the object down into 10-50 small component parts.
     - Example: For a "Car", generate separate wheels (cylinders), axles, chassis (cubes), bumpers, windshields, lights (spheres).
     - Example: For a "House", generate walls, individual pillars, roof segments, chimney, steps, windows.
  2. DECOMPOSITION: Use primitive shapes (CUBE, SPHERE, CYLINDER, CONE) to approximate complex forms.
  3. POSITIONING: Ensure parts are positioned relatively to form a coherent shape centered roughly at [0,0,0]. Y-axis is UP.
  4. SCALING: Use specific scales to shape the primitives (e.g., flattened cubes for plates, thin cylinders for poles).
  5. COLOR: Use a harmonious palette of Hex codes suitable for the object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Using Gemini 3 Flash for speed and reasoning
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responseMessage: { 
              type: Type.STRING, 
              description: "A short, engaging description of the complex model you built (in Chinese)." 
            },
            addedObjects: {
              type: Type.ARRAY,
              description: "List of 3D parts composing the model.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Descriptive name of the part (e.g., 'Front_Left_Wheel')" },
                  type: { 
                    type: Type.STRING, 
                    enum: ["CUBE", "SPHERE", "CYLINDER", "CONE"] 
                  },
                  position: { 
                    type: Type.ARRAY, 
                    items: { type: Type.NUMBER },
                    minItems: 3,
                    maxItems: 3,
                    description: "[x, y, z] coordinates"
                  },
                  rotation: { 
                    type: Type.ARRAY, 
                    items: { type: Type.NUMBER },
                    minItems: 3,
                    maxItems: 3,
                    description: "[x, y, z] euler rotation in radians"
                  },
                  scale: { 
                    type: Type.ARRAY, 
                    items: { type: Type.NUMBER },
                    minItems: 3,
                    maxItems: 3,
                    description: "[x, y, z] dimensions (1 is standard unit)"
                  },
                  color: { 
                    type: Type.STRING, 
                    description: "Hex color string (e.g., '#FF0000')" 
                  },
                },
                required: ["name", "type", "position", "rotation", "scale", "color"]
              }
            }
          },
          required: ["responseMessage", "addedObjects"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");

    // Check if we got objects
    if (!result.addedObjects || result.addedObjects.length === 0) {
      return { text: "AI 无法根据该描述生成有效的 3D 结构，请尝试更具体的描述。" };
    }

    // Map response to internal SceneObject type
    const newObjects: SceneObject[] = result.addedObjects.map((obj: any) => ({
      id: generateId(),
      name: obj.name || 'Part',
      type: (['CUBE', 'SPHERE', 'CYLINDER', 'CONE'].includes(obj.type)) ? obj.type as ObjectType : ObjectType.CUBE,
      position: obj.position || [0, 0, 0],
      rotation: obj.rotation || [0, 0, 0],
      scale: obj.scale || [1, 1, 1],
      color: obj.color || '#cccccc',
      visible: true
    }));

    return {
      text: result.responseMessage || "模型生成完毕。",
      objects: newObjects
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "生成模型时遇到问题，请检查网络或 API Key 设置。" };
  }
};
