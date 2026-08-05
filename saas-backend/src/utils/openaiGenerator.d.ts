interface Config {
    subject: string;
    numSets: number;
    questionsPerSet: number;
    difficulty: {
        easy: number;
        medium: number;
        hard: number;
    };
    questionTypes: string[];
    context: string;
}
export declare const generateQuestionsSet: (config: Config) => Promise<any>;
export {};
//# sourceMappingURL=openaiGenerator.d.ts.map