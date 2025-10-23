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
    const prompt = `Analyze this task and categorize it based on business impact and effort required. Return JSON: {"impact": "High|Medium|Low", "effort": "High|Medium|Low"}.

IMPACT refers to business value/urgency:
- High: Critical to business goals, has immediate consequences, or generates significant value
- Medium: Important but not critical, contributes to goals but with less urgency
- Low: Nice to have, minimal business impact, can be delayed

EFFORT refers to time/complexity:
- High: Takes days/weeks, requires significant resources, complex implementation
- Medium: Takes hours/days, moderate complexity, requires some planning
- Low: Takes minutes/hours, simple, straightforward to implement

Examples:
- "Fix critical production bug" → {"impact": "High", "effort": "Low"}
- "Build new reporting dashboard" → {"impact": "Medium", "effort": "High"}
- "Update button color" → {"impact": "Low", "effort": "Low"}
- "Implement user authentication" → {"impact": "High", "effort": "High"}

Task: "${taskTitle}"

Return only valid JSON with no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert project manager and business analyst specializing in task prioritization. Analyze tasks based on their business impact and implementation effort to provide accurate categorization.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Slightly higher temperature for more creativity with 3.5
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (parseError) {
      throw new Error("Failed to parse OpenAI response as JSON");
    }

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
      console.error("Invalid response structure:", parsed);
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
    const prompt = `Analyze these tasks and categorize each one based on business impact and effort required. Return JSON array: [{"impact": "High|Medium|Low", "effort": "High|Medium|Low"}].

IMPACT refers to business value/urgency:
- High: Critical to business goals, has immediate consequences, or generates significant value
- Medium: Important but not critical, contributes to goals but with less urgency
- Low: Nice to have, minimal business impact, can be delayed

EFFORT refers to time/complexity:
- High: Takes days/weeks, requires significant resources, complex implementation
- Medium: Takes hours/days, moderate complexity, requires some planning
- Low: Takes minutes/hours, simple, straightforward to implement

Tasks:
${taskTitles.map((title, index) => `${index + 1}. "${title}"`).join("\n")}

Return only valid JSON array with no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert project manager and business analyst specializing in task prioritization. Analyze tasks based on their business impact and implementation effort to provide accurate categorization.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Slightly higher temperature for more creativity with 3.5
      max_tokens: 600,
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
