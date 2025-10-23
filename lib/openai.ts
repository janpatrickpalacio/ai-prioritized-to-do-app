import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TaskCategorization {
  impact: "High" | "Medium" | "Low";
  effort: "High" | "Medium" | "Low";
}

export async function categorizeTask(
  taskTitle: string
): Promise<TaskCategorization> {
  try {
    const prompt = `Analyze this task and categorize it. Return JSON: {"impact": "High|Medium|Low", "effort": "High|Medium|Low"}. Impact = business value, Effort = time/complexity.

Task: "${taskTitle}"

Return only valid JSON with no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    const parsed = JSON.parse(response);

    // Validate the response structure
    if (
      typeof parsed.impact === "string" &&
      typeof parsed.effort === "string" &&
      ["High", "Medium", "Low"].includes(parsed.impact) &&
      ["High", "Medium", "Low"].includes(parsed.effort)
    ) {
      return {
        impact: parsed.impact as "High" | "Medium" | "Low",
        effort: parsed.effort as "High" | "Medium" | "Low",
      };
    } else {
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error categorizing task:", error);

    // Fallback to Medium/Medium if API fails
    return {
      impact: "Medium",
      effort: "Medium",
    };
  }
}

export async function categorizeTasks(
  taskTitles: string[]
): Promise<TaskCategorization[]> {
  try {
    const prompt = `Analyze these tasks and categorize each one. Return JSON array: [{"impact": "High|Medium|Low", "effort": "High|Medium|Low"}]. Impact = business value, Effort = time/complexity.

Tasks:
${taskTitles.map((title, index) => `${index + 1}. "${title}"`).join("\n")}

Return only valid JSON array with no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    const parsed = JSON.parse(response);

    // Validate the response structure
    if (Array.isArray(parsed) && parsed.length === taskTitles.length) {
      const validResults = parsed.map((item: any) => {
        if (
          typeof item.impact === "string" &&
          typeof item.effort === "string" &&
          ["High", "Medium", "Low"].includes(item.impact) &&
          ["High", "Medium", "Low"].includes(item.effort)
        ) {
          return {
            impact: item.impact as "High" | "Medium" | "Low",
            effort: item.effort as "High" | "Medium" | "Low",
          };
        } else {
          return {
            impact: "Medium" as "High" | "Medium" | "Low",
            effort: "Medium" as "High" | "Medium" | "Low",
          };
        }
      });

      return validResults;
    } else {
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error categorizing tasks:", error);

    // Fallback to Medium/Medium for all tasks if API fails
    return taskTitles.map(() => ({
      impact: "Medium" as "High" | "Medium" | "Low",
      effort: "Medium" as "High" | "Medium" | "Low",
    }));
  }
}
