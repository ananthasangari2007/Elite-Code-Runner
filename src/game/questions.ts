export type CategoryId = "variables" | "loops" | "arrays" | "strings" | "functions";
export type DifficultyId = "easy" | "medium" | "hard";

export type Question = {
  q: string;
  options: string[];
  answer: number; // index 0..3
  category: string;
  difficulty: string;
  code?: string;
  hint?: string;
};

export type LearningCategory = {
  id: CategoryId;
  label: string;
  badge: string;
  description: string;
};

export type DifficultyOption = {
  id: DifficultyId;
  label: string;
  description: string;
};

export type DifficultyCompletionMap = Record<DifficultyId, boolean>;
export type CategoryCompletionMap = Record<CategoryId, DifficultyCompletionMap>;

type QuestionSeed = Omit<Question, "category" | "difficulty">;

const PROGRESS_STORAGE_KEY = "cre-category-progress";

export const LEARNING_CATEGORIES: LearningCategory[] = [
  {
    id: "variables",
    label: "Variables, Datatypes, and Conditional Statements",
    badge: "Variables",
    description: "Declarations, data types, comparisons, if, else, and logic basics.",
  },
  {
    id: "loops",
    label: "Looping Statements with for, while, and do while",
    badge: "Loops",
    description: "Loop flow, entry and exit control, counting, and iteration patterns.",
  },
  {
    id: "arrays",
    label: "Arrays 1D, 2D, and 3D",
    badge: "Arrays",
    description: "Indexes, traversal, memory layout, and multidimensional arrays.",
  },
  {
    id: "strings",
    label: "Strings",
    badge: "Strings",
    description: "String basics, library helpers, and null-terminated character arrays.",
  },
  {
    id: "functions",
    label: "Functions in C",
    badge: "Functions",
    description: "Function syntax, return values, prototypes, recursion, and calls.",
  },
];

export const DIFFICULTIES: DifficultyOption[] = [
  {
    id: "easy",
    label: "Easy",
    description: "Warm-up questions to build confidence before the harder logic kicks in.",
  },
  {
    id: "medium",
    label: "Medium",
    description: "Mixed reasoning and output prediction with a little extra trickiness.",
  },
  {
    id: "hard",
    label: "Hard",
    description: "More logic-heavy questions that test conditions, patterns, and edge cases.",
  },
];

export const CATEGORY_SEQUENCE: CategoryId[] = [
  "variables",
  "loops",
  "arrays",
  "strings",
  "functions",
];

function getCategoryMeta(categoryId: CategoryId) {
  return LEARNING_CATEGORIES.find((category) => category.id === categoryId);
}

export function getCategoryLabel(categoryId: CategoryId) {
  return getCategoryMeta(categoryId)?.label ?? "C Programming";
}

export function getCategoryBadge(categoryId: CategoryId) {
  return getCategoryMeta(categoryId)?.badge ?? "Category";
}

export function getDifficultyLabel(difficultyId: DifficultyId) {
  return DIFFICULTIES.find((difficulty) => difficulty.id === difficultyId)?.label ?? "Level";
}

export function getCategoryLevelNumber(categoryId: CategoryId) {
  return CATEGORY_SEQUENCE.indexOf(categoryId) + 1;
}

export function getCategoryCompletionCount(
  progress: CategoryCompletionMap,
  categoryId: CategoryId,
) {
  return DIFFICULTIES.filter((difficulty) => progress[categoryId][difficulty.id]).length;
}

function withMeta(
  categoryId: CategoryId,
  difficultyId: DifficultyId,
  questions: QuestionSeed[],
): Question[] {
  const category = getCategoryBadge(categoryId);
  return questions.map((question) => ({
    ...question,
    category,
    difficulty: difficultyId,
  }));
}

function cloneAcrossDifficulties(
  categoryId: CategoryId,
  questions: QuestionSeed[],
): Record<DifficultyId, Question[]> {
  return {
    easy: withMeta(categoryId, "easy", questions),
    medium: withMeta(categoryId, "medium", questions),
    hard: withMeta(categoryId, "hard", questions),
  };
}

const variablesEasy = withMeta("variables", "easy", [
  {
    q: "Which of the following is a valid variable declaration in C?",
    options: ["int 1num;", "float num1;", "char @name;", "double num-2;"],
    answer: 1,
  },
  {
    q: "What is the size of int data type in most C compilers?",
    options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"],
    answer: 2,
  },
  {
    q: "Which data type is used to store a single character?",
    options: ["int", "float", "char", "double"],
    answer: 2,
  },
  {
    q: "What will be the output?",
    code: 'int a = 10;\nif(a > 5)\n    printf("Hello");\nelse\n    printf("Bye");',
    options: ["Hello", "Bye", "Error", "No output"],
    answer: 0,
  },
  {
    q: "Which operator is used to compare two values?",
    options: ["=", "==", "!=", "Both == and !="],
    answer: 3,
  },
  {
    q: "What will be the output?",
    code: 'int x = 3, y = 5;\nif(x == y)\n    printf("Equal");\nelse\n    printf("Not Equal");',
    options: ["Equal", "Not Equal", "Error", "No output"],
    answer: 1,
  },
  {
    q: "Which of the following is a correct if statement syntax?",
    options: ["if x > 5", "if(x > 5)", "if x > 5 then", "if(x > 5 then)"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int a = 0;\nif(a)\n    printf("True");\nelse\n    printf("False");',
    options: ["True", "False", "Error", "No output"],
    answer: 1,
  },
  {
    q: "Which keyword is used with if to handle an alternative condition?",
    options: ["otherwise", "else", "elseif", "then"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int a = 5;\nif(a = 10)\n    printf("Yes");\nelse\n    printf("No");',
    options: ["Yes", "No", "Error", "Depends"],
    answer: 0,
  },
]);

const variablesMedium = withMeta("variables", "medium", [
  {
    q: "What will be the output?",
    code: 'int a = 5, b = 10;\nif(a > b)\n    printf("A");\nelse if(a < b)\n    printf("B");\nelse\n    printf("C");',
    options: ["A", "B", "C", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int x = 10;\nif(x > 5)\n    if(x < 15)\n        printf("Hello");\n    else\n        printf("World");',
    options: ["Hello", "World", "HelloWorld", "No output"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int a = 0, b = 1;\nif(a && b)\n    printf("True");\nelse\n    printf("False");',
    options: ["True", "False", "Error", "No output"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int a = 5;\nif(a > 0 || a < 10)\n    printf("Yes");\nelse\n    printf("No");',
    options: ["Yes", "No", "Error", "Depends"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int a = -5;\nif(a > 0)\n    printf("Positive");\nelse if(a < 0)\n    printf("Negative");\nelse\n    printf("Zero");',
    options: ["Positive", "Negative", "Zero", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int x = 1;\nif(x == 1)\n    printf("One");\nif(x == 1)\n    printf("Again");',
    options: ["One", "Again", "OneAgain", "Error"],
    answer: 2,
  },
  {
    q: "What will be the output?",
    code: 'int a = 5;\nif(a > 2)\n    if(a > 10)\n        printf("A");\n    else\n        printf("B");',
    options: ["A", "B", "No output", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int a = 10;\nif(a == 10)\n    printf("X");\nelse if(a == 10)\n    printf("Y");\nelse\n    printf("Z");',
    options: ["X", "Y", "Z", "XY"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int a = 5, b = 0;\nif(a && b)\n    printf("Yes");\nelse if(a || b)\n    printf("Maybe");\nelse\n    printf("No");',
    options: ["Yes", "Maybe", "No", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int a = 2;\nif(a == 2);\n{\n    printf("Hello");\n}',
    options: ["Hello", "No output", "Error", "Infinite loop"],
    answer: 0,
  },
]);

const variablesHard = withMeta("variables", "hard", [
  {
    q: "Which condition correctly checks if a number n is prime?",
    options: ["if(n % i == 0)", "if(n % i != 0)", "if(flag == 0)", "if(n == 1)"],
    answer: 2,
  },
  {
    q: "Which condition correctly identifies an odd number?",
    options: ["if(n % 2 == 0)", "if(n % 2 != 0)", "if(n / 2 == 1)", "if(n % 1 == 0)"],
    answer: 1,
  },
  {
    q: "Which condition correctly checks if a number is even?",
    options: ["if(n % 2 == 1)", "if(n % 2 == 0)", "if(n / 2 == 0)", "if(n % 2 != 0)"],
    answer: 1,
  },
  {
    q: "Which condition correctly checks if a person is eligible to vote?",
    options: ["if(age > 18)", "if(age >= 18)", "if(age == 18)", "if(age < 18)"],
    answer: 1,
  },
  {
    q: "Which is the correct condition for a leap year?",
    options: [
      "if(year % 4 == 0)",
      "if(year % 100 == 0)",
      "if((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)",
      "if(year % 400 != 0)",
    ],
    answer: 2,
  },
  {
    q: "Which condition correctly checks if a number is positive?",
    options: ["if(n > 0)", "if(n >= 0)", "if(n < 0)", "if(n == 0)"],
    answer: 0,
  },
  {
    q: "Which condition correctly checks if a number is negative?",
    options: ["if(n < 0)", "if(n <= 0)", "if(n == 0)", "if(n > 0)"],
    answer: 0,
  },
  {
    q: "Which condition correctly checks if a number lies between 10 and 50 inclusive?",
    options: [
      "if(n > 10 || n < 50)",
      "if(n >= 10 && n <= 50)",
      "if(n <= 10 && n >= 50)",
      "if(n > 10 && n > 50)",
    ],
    answer: 1,
  },
  {
    q: "Which condition correctly checks if a number is divisible by both 3 and 5?",
    options: [
      "if(n % 3 == 0 || n % 5 == 0)",
      "if(n % 3 == 0 && n % 5 == 0)",
      "if(n % 15 != 0)",
      "if(n % 3 != 0 && n % 5 != 0)",
    ],
    answer: 1,
  },
  {
    q: "Which condition correctly checks if a is greater than b?",
    options: ["if(a < b)", "if(a == b)", "if(a > b)", "if(a != b)"],
    answer: 2,
  },
]);

const loopsEasy = withMeta("loops", "easy", [
  {
    q: "What is a loop in C?",
    options: [
      "A data type",
      "A control structure to repeat statements",
      "A function",
      "A variable",
    ],
    answer: 1,
  },
  {
    q: "Which loop checks the condition first before executing?",
    options: ["do-while", "while", "for", "None"],
    answer: 1,
  },
  {
    q: "Which loop executes at least once even if the condition is false?",
    options: ["while", "do-while", "for", "if"],
    answer: 1,
  },
  {
    q: "What is required to stop a loop?",
    options: [
      "A break keyword only",
      "A condition that becomes false",
      "A variable declaration",
      "A function call",
    ],
    answer: 1,
  },
  {
    q: "What happens if the loop condition never becomes false?",
    options: ["Program ends", "Loop runs only once", "Infinite loop occurs", "Error occurs"],
    answer: 2,
  },
  {
    q: "Which of the following is the correct structure of a while loop?",
    options: [
      "while condition { }",
      "while(condition) { }",
      "while { condition }",
      "while(condition;)",
    ],
    answer: 1,
  },
  {
    q: "Which keyword is used with while in a do-while loop?",
    options: ["repeat", "until", "do", "loop"],
    answer: 2,
  },
  {
    q: "In a loop, what is typically updated to avoid infinite execution?",
    options: ["Function", "Variable", "Header file", "Operator"],
    answer: 1,
  },
  {
    q: "Which loop is also called an entry-controlled loop?",
    options: ["do-while", "while", "switch", "if"],
    answer: 1,
  },
  {
    q: "Which loop is also called an exit-controlled loop?",
    options: ["while", "for", "do-while", "if"],
    answer: 2,
  },
]);

const loopsMedium = withMeta("loops", "medium", [
  {
    q: "What will be the output?",
    code: 'int i = 1;\nwhile(i <= 5)\n{\n    printf("%d ", i);\n    i += 2;\n}',
    options: ["1 2 3 4 5", "1 3 5", "1 3 5 7", "Infinite loop"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int i = 0;\nwhile(i < 3)\n{\n    printf("%d ", i);\n    i++;\n}',
    options: ["1 2 3", "0 1 2", "0 1 2 3", "Infinite loop"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int i = 5;\nwhile(i > 0)\n{\n    printf("%d ", i);\n    i--;\n}',
    options: ["1 2 3 4 5", "5 4 3 2 1", "Infinite loop", "5 4 3"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int i = 1;\ndo\n{\n    printf("%d ", i);\n    i++;\n} while(i <= 3);',
    options: ["1 2 3", "1 2", "0 1 2", "Infinite loop"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int i = 10;\nwhile(i >= 5)\n{\n    printf("%d ", i);\n    i -= 2;\n}',
    options: ["10 8 6", "10 8 6 4", "10 9 8 7 6 5", "Infinite loop"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int i = 1, sum = 0;\nwhile(i <= 3)\n{\n    sum += i;\n    i++;\n}\nprintf("%d", sum);',
    options: ["3", "6", "5", "0"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int i = 1;\nwhile(i <= 3)\n{\n    printf("* ");\n    i++;\n}',
    options: ["* * *", "***", "* *", "Infinite loop"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int i = 1;\ndo\n{\n    printf("%d ", i);\n    i += 2;\n} while(i <= 5);',
    options: ["1 3 5", "1 3", "1 2 3 4 5", "Infinite loop"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int i = 3;\nwhile(i)\n{\n    printf("%d ", i);\n    i--;\n}',
    options: ["3 2 1", "3 2 1 0", "Infinite loop", "Error"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int i = 0;\ndo\n{\n    printf("Hi ");\n    i++;\n} while(i < 2);',
    options: ["Hi", "Hi Hi", "Infinite loop", "No output"],
    answer: 1,
  },
]);

const loopsHard = withMeta("loops", "hard", [
  {
    q: "Which loop correctly checks factors of a number n when testing for prime?",
    options: [
      "for(i = 1; i <= n; i++)",
      "for(i = 2; i < n; i++)",
      "for(i = 0; i < n; i++)",
      "for(i = n; i > 1; i--)",
    ],
    answer: 1,
  },
  {
    q: "Which loop correctly calculates factorial of n?",
    options: [
      "for(i = 0; i <= n; i++)",
      "for(i = 1; i <= n; i++)",
      "for(i = 1; i < n; i++)",
      "for(i = n; i == 1; i--)",
    ],
    answer: 1,
  },
  {
    q: "Which condition correctly processes all digits of a number?",
    options: ["while(n == 0)", "while(n != 0)", "while(n < 10)", "while(n > 10)"],
    answer: 1,
  },
  {
    q: "Which loop will cause an infinite loop?",
    options: [
      "while(i < 10) i++;",
      "while(i > 0) i--;",
      "while(i < 10) i--;",
      "while(i == 0) i++;",
    ],
    answer: 2,
  },
  {
    q: "Which loop is correct for summing digits of a number?",
    options: ["while(n == 0)", "while(n != 0)", "while(n < 10)", "while(n > 100)"],
    answer: 1,
  },
  {
    q: "Which condition ensures only even numbers are processed?",
    options: ["if(i % 2 != 0)", "if(i % 2 == 0)", "if(i / 2 == 0)", "if(i % 1 == 0)"],
    answer: 1,
  },
  {
    q: "Which condition correctly stops a loop at zero for digit-processing patterns?",
    options: ["while(n == 0)", "while(n != 0)", "while(n > 0)", "while(n < 0)"],
    answer: 1,
  },
  {
    q: "Which loop correctly generates multiples of 3 up to 30?",
    options: [
      "for(i = 1; i <= 30; i++)",
      "for(i = 3; i <= 30; i += 3)",
      "for(i = 0; i < 30; i++)",
      "for(i = 3; i < 30; i++)",
    ],
    answer: 1,
  },
  {
    q: "Which ensures a loop executes at least once?",
    options: ["while(i < 0)", "do { } while(i < 0);", "while(i > 0)", "if(i < 0)"],
    answer: 1,
  },
  {
    q: "Which statement correctly exits a loop immediately?",
    options: ["continue;", "stop;", "break;", "exit;"],
    answer: 2,
  },
]);

const arraysEasy = withMeta("arrays", "easy", [
  {
    q: "What is an array in C?",
    options: [
      "Collection of different data types",
      "Collection of same data type elements",
      "A loop",
      "A function",
    ],
    answer: 1,
  },
  {
    q: "Which is a correct 1D array declaration?",
    options: ["int arr;", "int arr[5];", "arr int[5];", "int[5] arr;"],
    answer: 1,
  },
  {
    q: "Array indexing starts from?",
    options: ["1", "0", "-1", "Depends"],
    answer: 1,
  },
  {
    q: "How do you access an element in a 1D array?",
    options: ["arr(i)", "arr[i]", "arr{i}", "arr<i>"],
    answer: 1,
  },
  {
    q: "Which is a correct 2D array declaration?",
    options: ["int arr[2,3];", "int arr[2][3];", "int arr[][];", "arr[2][3] int;"],
    answer: 1,
  },
  {
    q: "How do you access an element in a 2D array?",
    options: ["arr[i]", "arr[i][j]", "arr(i,j)", "arr[i,j]"],
    answer: 1,
  },
  {
    q: "Which is a correct 3D array declaration?",
    options: ["int arr[2][2][2];", "int arr[2,2,2];", "int arr[][][];", "arr[2][2][2] int;"],
    answer: 0,
  },
  {
    q: "How do you access an element in a 3D array?",
    options: ["arr[i][j]", "arr[i][j][k]", "arr(i,j,k)", "arr[i,j,k]"],
    answer: 1,
  },
  {
    q: "How many elements are in int arr[2][3];?",
    options: ["5", "6", "3", "2"],
    answer: 1,
  },
  {
    q: "What happens if you access an index outside array bounds?",
    options: ["Compile-time error", "Garbage value", "Always 0", "Program stops"],
    answer: 1,
  },
]);

const arraysMedium = withMeta("arrays", "medium", [
  {
    q: "What will be the output?",
    code: 'int arr[3] = {10, 20, 30};\nprintf("%d", arr[0]);',
    options: ["10", "20", "30", "Error"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int arr[3] = {10, 20, 30};\nprintf("%d", arr[2]);',
    options: ["10", "20", "30", "Error"],
    answer: 2,
  },
  {
    q: "What will be the output?",
    code: 'int arr[3] = {1, 2, 3};\nint i, sum = 0;\nfor(i = 0; i < 3; i++)\n    sum += arr[i];\nprintf("%d", sum);',
    options: ["3", "5", "6", "0"],
    answer: 2,
  },
  {
    q: "What will be the output?",
    code: 'int arr[3] = {1, 2, 3};\nint i;\nfor(i = 2; i >= 0; i--)\n    printf("%d ", arr[i]);',
    options: ["1 2 3", "3 2 1", "2 1 3", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int arr[5] = {1, 2};\nprintf("%d", arr[3]);',
    options: ["0", "Garbage", "2", "Error"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int arr[2][2] = {{1, 2}, {3, 4}};\nprintf("%d", arr[1][0]);',
    options: ["1", "2", "3", "4"],
    answer: 2,
  },
  {
    q: "What will be the output?",
    code: 'int arr[2][2] = {{1, 2}, {3, 4}};\nint i, j, sum = 0;\nfor(i = 0; i < 2; i++)\nfor(j = 0; j < 2; j++)\n    sum += arr[i][j];\nprintf("%d", sum);',
    options: ["10", "8", "6", "4"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int arr[2][3] = {{1,2,3},{4,5,6}};\nprintf("%d", arr[0][2]);',
    options: ["3", "6", "2", "4"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int arr[2][2][2] = {{{1,2},{3,4}},{{5,6},{7,8}}};\nprintf("%d", arr[1][1][0]);',
    options: ["5", "6", "7", "8"],
    answer: 2,
  },
  {
    q: "What will be the output?",
    code: 'int arr[4] = {1,2,3,4};\nint i;\nfor(i = 0; i < 4; i += 2)\n    printf("%d ", arr[i]);',
    options: ["1 2 3 4", "1 3", "2 4", "1 2"],
    answer: 1,
  },
]);

const arraysHard = withMeta("arrays", "hard", [
  {
    q: "What will be the output?",
    code: 'int arr[4] = {1,2,3,4};\nint i, sum = 0;\n\nfor(i = 0; i < 4; i++) {\n    if(i % 2 != 0)\n        sum += arr[i];\n}\nprintf("%d", sum);',
    options: ["6", "4", "5", "10"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int arr[5] = {1,2,3};\nint i;\n\nfor(i = 0; i < 5; i++)\n    printf("%d ", arr[i]);',
    options: ["1 2 3", "1 2 3 0 0", "1 2 3 Garbage Garbage", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int arr[2][2] = {{1,2},{3,4}};\nint i, j, sum = 0;\n\nfor(i = 0; i < 2; i++)\nfor(j = 0; j < 2; j++)\n    if(i != j)\n        sum += arr[i][j];\n\nprintf("%d", sum);',
    options: ["5", "4", "6", "3"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int arr[3] = {5,10,15};\nint i;\n\nfor(i = 0; i < 3; i++) {\n    arr[i] = arr[i] - 5;\n}\nprintf("%d", arr[2]);',
    options: ["15", "10", "5", "0"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int arr[2][2][2] = {\n    {{1,2},{3,4}},\n    {{5,6},{7,8}}\n};\n\nprintf("%d", arr[0][1][1]);',
    options: ["4", "3", "2", "8"],
    answer: 0,
  },
  {
    q: "Which logic correctly finds SUM of even elements in array?",
    options: [
      "if(arr[i] % 2 == 1)\n    sum += arr[i];",
      "if(arr[i] % 2 == 0)\n    sum += arr[i];",
      "if(i % 2 == 0)\n    sum += arr[i];",
      "if(arr[i] / 2 == 0)\n    sum += arr[i];",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly counts odd numbers in array?",
    options: [
      "if(arr[i] % 2 == 0)\n    count++;",
      "if(arr[i] % 2 != 0)\n    count++;",
      "if(i % 2 != 0)\n    count++;",
      "if(arr[i] / 2 != 0)\n    count++;",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly finds maximum element?",
    options: [
      "if(arr[i] < max)\n    max = arr[i];",
      "if(arr[i] > max)\n    max = arr[i];",
      "if(i > max)\n    max = arr[i];",
      "if(arr[i] == max)\n    max++;",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly checks if array element is divisible by 3?",
    options: [
      "if(arr[i] % 3 == 0)",
      "if(arr[i] / 3 == 0)",
      "if(i % 3 == 0)",
      "if(arr[i] % 3 == 1)",
    ],
    answer: 0,
  },
  {
    q: "Which logic correctly reverses traversal of array?",
    options: [
      "for(i = 0; i < n; i++)",
      "for(i = n; i >= 0; i--)",
      "for(i = n-1; i >= 0; i--)",
      "for(i = n-1; i > 0; i--)",
    ],
    answer: 2,
  },
]);

const stringsEasy = withMeta("strings", "easy", [
  {
    q: "What is a string in C?",
    options: [
      "Collection of integers",
      "Collection of characters ending with \\0",
      "A loop",
      "A function",
    ],
    answer: 1,
  },
  {
    q: "Which is a correct way to declare a string?",
    options: ["char str;", "char str[10];", "string str[10];", "char str[];"],
    answer: 1,
  },
  {
    q: "What is the null character in C?",
    options: ["\\n", "\\t", "\\0", "\\a"],
    answer: 2,
  },
  {
    q: "What does \\0 represent in a string?",
    options: ["Start of string", "End of string", "Space", "New line"],
    answer: 1,
  },
  {
    q: "Which function is used to find the length of a string?",
    options: ["length()", "strcount()", "strlen()", "size()"],
    answer: 2,
  },
  {
    q: "Which header file is required for string functions?",
    options: ["stdio.h", "stdlib.h", "string.h", "math.h"],
    answer: 2,
  },
  {
    q: "How do you access a character in a string?",
    options: ["str(i)", "str[i]", "str{i}", "str<i>"],
    answer: 1,
  },
  {
    q: "Which function is used to copy strings?",
    options: ["strcopy()", "copy()", "strcpy()", "strcat()"],
    answer: 2,
  },
  {
    q: "Which function is used to concatenate strings?",
    options: ["strjoin()", "strcat()", "stradd()", "append()"],
    answer: 1,
  },
  {
    q: "What is the output type of strlen()?",
    options: ["char", "float", "int", "void"],
    answer: 2,
  },
]);

const stringsMedium = withMeta("strings", "medium", [
  {
    q: "What will be the output?",
    code: 'char str[] = "Hello";\nprintf("%c", str[1]);',
    options: ["H", "e", "l", "o"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'char str[] = "Code";\nprintf("%d", strlen(str));',
    options: ["3", "4", "5", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'char str1[10] = "Hi";\nchar str2[] = "All";\n\nstrcpy(str1, str2);\nprintf("%s", str1);',
    options: ["Hi", "All", "HiAll", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'char str1[20] = "Hello ";\nchar str2[] = "World";\n\nstrcat(str1, str2);\nprintf("%s", str1);',
    options: ["Hello", "World", "Hello World", "Error"],
    answer: 2,
  },
  {
    q: "What will be the output?",
    code: 'char str[] = "ABC";\nint i;\n\nfor(i = 0; str[i] != \'\\0\'; i++)\n    printf("%c ", str[i]);',
    options: ["A B C", "ABC", "A B", "Error"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'char str[] = "Test";\nint i = 0;\n\nwhile(str[i] != \'\\0\') {\n    i++;\n}\nprintf("%d", i);',
    options: ["3", "4", "5", "0"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'char str[] = "Hello";\n\nstr[0] = \'Y\';\nprintf("%s", str);',
    options: ["Hello", "Yello", "Yello\\0", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'char str1[10] = "Hi";\nchar str2[10] = "Hi";\n\nif(strcmp(str1, str2) == 0)\n    printf("Equal");\nelse\n    printf("Not Equal");',
    options: ["Equal", "Not Equal", "Error", "0"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'char str[] = "A";\nprintf("%d", strlen(str));',
    options: ["0", "1", "2", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'char str[5] = "Hello";\nprintf("%s", str);',
    options: ["Hello", "Hell", "Error", "Garbage"],
    answer: 3,
  },
]);

const stringsHard = withMeta("strings", "hard", [
  {
    q: "What will be the output?",
    code: "char str[] = \"hello\";\nint i, count = 0;\n\nfor(i = 0; str[i] != '\\0'; i++) {\n    if(str[i] == 'l')\n        count++;\n}\nprintf(\"%d\", count);",
    options: ["1", "2", "3", "0"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'char str[] = "abc";\nint i;\n\nfor(i = 0; str[i] != \'\\0\'; i++) {\n    str[i] = str[i] + 1;\n}\nprintf("%s", str);',
    options: ["abc", "bcd", "cde", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'char str1[20] = "Hi";\nchar str2[] = "There";\n\nstrcat(str1, str2);\nprintf("%s", str1);',
    options: ["HiThere", "ThereHi", "Hi There", "Error"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'char str[] = "ABC";\nint i;\n\nfor(i = 0; str[i] != \'\\0\'; i++) {\n    if(str[i] % 2 == 0)\n        printf("%c ", str[i]);\n}',
    options: ["A B C", "B", "A C", "No output"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'char str[] = "hello";\n\nprintf("%d", sizeof(str));',
    options: ["5", "6", "4", "Garbage"],
    answer: 1,
  },
  {
    q: "Which logic correctly counts vowels in a string?",
    options: [
      "if(str[i] == 'a' && str[i] == 'e' && str[i] == 'i')\n    count++;",
      "if(str[i] == 'a' || str[i] == 'e' || str[i] == 'i' || str[i]=='o' || str[i]=='u')\n    count++;",
      "if(str[i] % 2 == 0)\n    count++;",
      "if(i == 'a' || i == 'e')\n    count++;",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly finds length of string manually?",
    options: [
      "for(i = 0; str[i] == '\\0'; i++);",
      "for(i = 0; str[i] != '\\0'; i++);",
      "for(i = 1; str[i] != '\\0'; i++);",
      "for(i = 0; i < str[i]; i++);",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly converts lowercase to uppercase?",
    options: [
      "str[i] = str[i] - 32;",
      "str[i] = str[i] + 32;",
      "str[i] = str[i] * 2;",
      "str[i] = str[i] / 2;",
    ],
    answer: 0,
  },
  {
    q: "Which logic correctly compares two strings manually?",
    options: [
      "if(str1 == str2)",
      "if(strcmp(str1, str2) == 0)",
      "if(str1[i] = str2[i])",
      "if(str1[i] > str2)",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly reverses a string?",
    options: [
      'for(i = 0; i < n; i++)\n    printf("%c", str[i]);',
      'for(i = n-1; i >= 0; i--)\n    printf("%c", str[i]);',
      'for(i = 1; i < n; i++)\n    printf("%c", str[i]);',
      'for(i = n; i >= 0; i--)\n    printf("%c", str[i]);',
    ],
    answer: 1,
  },
]);

const functionsEasy = withMeta("functions", "easy", [
  {
    q: "What is a function in C?",
    options: [
      "A loop",
      "A block of code that performs a specific task",
      "A variable",
      "A data type",
    ],
    answer: 1,
  },
  {
    q: "Which keyword is used to define a function?",
    options: ["function", "def", "No keyword needed", "define"],
    answer: 2,
  },
  {
    q: "Which of the following is a correct function declaration?",
    options: ["int func;", "int func()", "func int()", "function int()"],
    answer: 1,
  },
  {
    q: "What is the return type of a function?",
    options: [
      "The variable name",
      "The data type of value returned",
      "The function name",
      "The parameter",
    ],
    answer: 1,
  },
  {
    q: "Which keyword is used to return a value from a function?",
    options: ["break", "continue", "return", "exit"],
    answer: 2,
  },
  {
    q: "Which of the following is a function call?",
    options: ["int add()", "add();", "return add;", "call add;"],
    answer: 1,
  },
  {
    q: "What are parameters in a function?",
    options: [
      "Variables inside function definition",
      "Values passed to function",
      "Return values",
      "Loop variables",
    ],
    answer: 1,
  },
  {
    q: "What is a function with no return value called?",
    options: ["int function", "void function", "float function", "char function"],
    answer: 1,
  },
  {
    q: "Which is a correct function with no parameters?",
    options: ["int func(int a)", "void func()", "func()", "int func[]"],
    answer: 1,
  },
  {
    q: "Which of the following is a built-in function?",
    options: ["main()", "printf()", "add()", "sum()"],
    answer: 1,
  },
]);

const functionsMedium = withMeta("functions", "medium", [
  {
    q: "What will be the output?",
    code: 'int add() {\n    return 5 + 3;\n}\n\nint main() {\n    printf("%d", add());\n}',
    options: ["5", "3", "8", "Error"],
    answer: 2,
  },
  {
    q: "What will be the output?",
    code: 'int square(int n) {\n    return n * n;\n}\n\nint main() {\n    printf("%d", square(4));\n}',
    options: ["8", "16", "4", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'void show() {\n    printf("Hello");\n}\n\nint main() {\n    show();\n}',
    options: ["Hello", "Error", "No output", "0"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int fun(int a) {\n    a = a + 5;\n    return a;\n}\n\nint main() {\n    int x = 10;\n    printf("%d", fun(x));\n}',
    options: ["10", "15", "5", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int fun(int a) {\n    a = a * 2;\n    return a;\n}\n\nint main() {\n    int x = 5;\n    fun(x);\n    printf("%d", x);\n}',
    options: ["10", "5", "0", "Error"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int fun(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    printf("%d", fun(2,3));\n}',
    options: ["5", "6", "23", "Error"],
    answer: 0,
  },
  {
    q: "What will be the output?",
    code: 'int fun(int a) {\n    if(a > 5)\n        return 1;\n    else\n        return 0;\n}\n\nint main() {\n    printf("%d", fun(3));\n}',
    options: ["1", "0", "Error", "Garbage"],
    answer: 1,
  },
  {
    q: "What will be the output?",
    code: 'int fun() {\n    int a = 5;\n}\n\nint main() {\n    printf("%d", fun());\n}',
    options: ["5", "0", "Garbage", "Error"],
    answer: 2,
  },
  {
    q: "What will be the output?",
    code: 'int fun(int a) {\n    return a + fun(a - 1);\n}\n\nint main() {\n    printf("%d", fun(1));\n}',
    options: ["1", "0", "Infinite recursion", "Error"],
    answer: 2,
  },
  {
    q: "What will be the output?",
    code: 'int fun(int a) {\n    static int x = 0;\n    x = x + a;\n    return x;\n}\n\nint main() {\n    printf("%d ", fun(2));\n    printf("%d ", fun(3));\n}',
    options: ["2 3", "2 5", "5 5", "3 2"],
    answer: 1,
  },
]);

const functionsHard = withMeta("functions", "hard", [
  {
    q: "Which logic correctly swaps two numbers using functions (call by value NOT allowed)?",
    options: [
      "void swap(int a, int b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}",
      "void swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}",
      "void swap(int a, int b) {\n    a = b;\n    b = a;\n}",
      "void swap(int *a, int b) {\n    *a = b;\n}",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly finds factorial using recursion?",
    options: [
      "int fact(int n) {\n    return n * fact(n);\n}",
      "int fact(int n) {\n    if(n == 0)\n        return 1;\n    else\n        return n * fact(n - 1);\n}",
      "int fact(int n) {\n    return n + fact(n - 1);\n}",
      "int fact(int n) {\n    if(n == 1)\n        return 0;\n}",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly checks if a number is even using function?",
    options: ["if(n % 2 = 0)", "if(n / 2 == 0)", "if(n % 2 == 0)", "if(n % 2 == 1)"],
    answer: 2,
  },
  {
    q: "Which logic correctly returns maximum of two numbers?",
    options: [
      "if(a < b)\n    return a;\nelse\n    return b;",
      "if(a > b)\n    return a;\nelse\n    return b;",
      "if(a == b)\n    return 0;",
      "return a + b;",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly counts digits in a number using function?",
    options: [
      "while(n > 0) {\n    count++;\n}",
      "while(n > 0) {\n    n = n / 10;\n    count++;\n}",
      "while(n > 0) {\n    n = n * 10;\n}",
      "if(n > 0)\n    count++;",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly reverses a number using function?",
    options: [
      "rev = rev * 10 + n % 10;\nn = n / 10;",
      "rev = n % 10;\nn = n * 10;",
      "rev = n + rev;",
      "rev = n / 10;",
    ],
    answer: 0,
  },
  {
    q: "Which logic correctly checks if a number is prime using function?",
    options: [
      "for(i = 2; i < n; i++)\n    if(n % i == 0)\n        return 1;",
      "for(i = 2; i < n; i++)\n    if(n % i == 0)\n        return 0;\nreturn 1;",
      "if(n % 2 == 0)\n    return 1;",
      "return n;",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly uses static variable inside function?",
    options: ["int x = 0;\nx++;", "static int x = 0;\nx++;", "auto int x = 0;", "register int x;"],
    answer: 1,
  },
  {
    q: "Which logic correctly returns sum of array using function?",
    options: [
      "sum = arr[i];",
      "for(i = 0; i < n; i++)\n    sum += arr[i];\nreturn sum;",
      "return arr;",
      "sum = 0;",
    ],
    answer: 1,
  },
  {
    q: "Which logic correctly prevents infinite recursion?",
    options: [
      "return fun(n);",
      "if(n == 0)\n    return 0;\nelse\n    return fun(n - 1);",
      "fun(n + 1);",
      "while(1)",
    ],
    answer: 1,
  },
]);

export const DEMO_QUESTION_SET: Question[] = [
  {
    category: "Variables",
    difficulty: "demo",
    q: "What is the default value of an uninitialized local variable in C?",
    options: ["0", "Garbage value", "NULL", "1"],
    answer: 1,
  },
  {
    category: "Conditionals",
    difficulty: "demo",
    q: "What will be the output?",
    code: 'int x = 5;\n\nif(x > 3)\n    printf("A");\nelse\n    printf("B");',
    options: ["A", "B", "Error", "No output"],
    answer: 0,
  },
  {
    category: "Loops",
    difficulty: "demo",
    q: "What will be the output?",
    code: 'int i;\nfor(i = 1; i <= 3; i++)\n    printf("%d ", i);',
    options: ["1 2 3", "0 1 2", "1 2", "3 2 1"],
    answer: 0,
  },
  {
    category: "Arrays",
    difficulty: "demo",
    q: "What will be the output?",
    code: 'int arr[3] = {1, 2, 3};\nprintf("%d", arr[1]);',
    options: ["1", "2", "3", "Error"],
    answer: 1,
  },
  {
    category: "Strings",
    difficulty: "demo",
    q: 'What does strlen("Hi") return?',
    options: ["1", "2", "3", "0"],
    answer: 1,
  },
  {
    category: "Functions",
    difficulty: "demo",
    q: "What will be the output?",
    code: 'int fun(int a) {\n    return a * 2;\n}\n\nint main() {\n    int x = 3;\n    printf("%d", fun(x));\n}',
    options: ["3", "6", "9", "Error"],
    answer: 1,
  },
  {
    category: "Arrays",
    difficulty: "demo",
    q: "What will be the output?",
    code: 'int arr[4] = {1,2,3,4};\nint i, sum = 0;\n\nfor(i = 0; i < 4; i++) {\n    if(arr[i] % 2 == 0)\n        sum += arr[i];\n}\nprintf("%d", sum);',
    options: ["10", "6", "4", "2"],
    answer: 1,
  },
  {
    category: "Logic",
    difficulty: "demo",
    q: "Which logic correctly checks if a number is prime?",
    options: [
      "if(n % 2 == 0)\n    return 1;",
      "for(i = 2; i < n; i++)\n    if(n % i == 0)\n        return 0;\nreturn 1;",
      "if(n == 1)\n    return 1;",
      "return n % 2;",
    ],
    answer: 1,
  },
  {
    category: "Strings",
    difficulty: "demo",
    q: "Which logic correctly prints a string in reverse?",
    options: [
      "for(i = 0; str[i] != '\\0'; i++)\n    printf(\"%c\", str[i]);",
      'for(i = n-1; i >= 0; i--)\n    printf("%c", str[i]);',
      'for(i = 1; i < n; i++)\n    printf("%c", str[i]);',
      'printf("%s", str);',
    ],
    answer: 1,
  },
  {
    category: "Functions",
    difficulty: "demo",
    q: "Which logic correctly swaps two numbers using function?",
    options: [
      "void swap(int a, int b) {\n    int t = a;\n    a = b;\n    b = t;\n}",
      "void swap(int *a, int *b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}",
      "a = b;\nb = a;",
      "swap(a,b);",
    ],
    answer: 1,
  },
];

export const QUESTION_BANK: Record<CategoryId, Record<DifficultyId, Question[]>> = {
  variables: {
    easy: variablesEasy,
    medium: variablesMedium,
    hard: variablesHard,
  },
  loops: {
    easy: loopsEasy,
    medium: loopsMedium,
    hard: loopsHard,
  },
  arrays: {
    easy: arraysEasy,
    medium: arraysMedium,
    hard: arraysHard,
  },
  strings: {
    easy: stringsEasy,
    medium: stringsMedium,
    hard: stringsHard,
  },
  functions: {
    easy: functionsEasy,
    medium: functionsMedium,
    hard: functionsHard,
  },
};

function getQuestionFingerprint(question: Question) {
  return `${question.q}::${question.code ?? ""}::${question.options.join("|")}`;
}

function getOrderedRunPools(categoryId: CategoryId, difficultyId: DifficultyId) {
  const categoryPool = QUESTION_BANK[categoryId];

  if (difficultyId === "easy") {
    return [categoryPool.easy, categoryPool.medium, categoryPool.hard];
  }

  if (difficultyId === "medium") {
    return [categoryPool.medium, categoryPool.easy, categoryPool.hard];
  }

  return [categoryPool.hard, categoryPool.medium, categoryPool.easy];
}

export function getAdaptiveHint(question: Question) {
  if (question.hint) return question.hint;

  const searchableText = `${question.q} ${question.category} ${question.code ?? ""}`.toLowerCase();

  if (question.code) {
    if (/\bfor\b|\bwhile\b|\bdo\b/.test(searchableText)) {
      return "Dry-run each loop iteration and watch how the counter changes.";
    }

    if (/\bif\b|\belse\b/.test(searchableText)) {
      return "Evaluate the condition first, then follow only the branch that becomes true.";
    }

    if (/str(len|cpy|cat|cmp)|char /.test(searchableText)) {
      return "Remember that C strings are character arrays that end with the null character.";
    }

    if (/\[[^\]]*\]/.test(question.code) || searchableText.includes("array")) {
      return "Track the indexes carefully. C arrays start at index 0.";
    }

    if (/return|main|fun\(|printf/.test(searchableText)) {
      return "Trace the values passed into the function and what gets returned back out.";
    }

    return "Run the code line by line and keep track of how each variable changes.";
  }

  if (searchableText.includes("array")) {
    return "Think about the array shape first, then map the correct index access pattern.";
  }

  if (searchableText.includes("string")) {
    return "Focus on how string functions work and where the null terminator matters.";
  }

  if (searchableText.includes("loop")) {
    return "Picture the loop counter at the start and end of every pass.";
  }

  if (searchableText.includes("function")) {
    return "Check the function signature, parameters, and return type before choosing.";
  }

  return "Eliminate the invalid C syntax first, then choose the option that matches the concept.";
}

export function getQuestionSet(
  categoryId: CategoryId,
  difficultyId: DifficultyId,
  count = QUESTION_BANK[categoryId][difficultyId].length,
) {
  const seen = new Set<string>();
  const runPool: Question[] = [];

  for (const pool of getOrderedRunPools(categoryId, difficultyId)) {
    for (const question of pool) {
      const fingerprint = getQuestionFingerprint(question);
      if (seen.has(fingerprint)) continue;
      seen.add(fingerprint);
      runPool.push({
        ...question,
        difficulty: difficultyId,
        hint: getAdaptiveHint(question),
      });
    }
  }

  return runPool.slice(0, Math.min(count, runPool.length));
}

export function getDemoQuestionSet(count = DEMO_QUESTION_SET.length) {
  return DEMO_QUESTION_SET.slice(0, Math.min(count, DEMO_QUESTION_SET.length)).map((question) => ({
    ...question,
    hint: getAdaptiveHint(question),
  }));
}

export function getAllQuestions() {
  return [
    ...Object.values(QUESTION_BANK).flatMap((categoryPool) => Object.values(categoryPool).flat()),
    ...DEMO_QUESTION_SET,
  ];
}

function createEmptyCompletionMap(): CategoryCompletionMap {
  return {
    variables: { easy: false, medium: false, hard: false },
    loops: { easy: false, medium: false, hard: false },
    arrays: { easy: false, medium: false, hard: false },
    strings: { easy: false, medium: false, hard: false },
    functions: { easy: false, medium: false, hard: false },
  };
}

export function getCategoryCompletionMap(): CategoryCompletionMap {
  if (typeof window === "undefined") return createEmptyCompletionMap();

  const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!raw) return createEmptyCompletionMap();

  try {
    const parsed = JSON.parse(raw) as Partial<CategoryCompletionMap>;
    const defaults = createEmptyCompletionMap();

    return {
      variables: { ...defaults.variables, ...parsed.variables },
      loops: { ...defaults.loops, ...parsed.loops },
      arrays: { ...defaults.arrays, ...parsed.arrays },
      strings: { ...defaults.strings, ...parsed.strings },
      functions: { ...defaults.functions, ...parsed.functions },
    };
  } catch {
    return createEmptyCompletionMap();
  }
}

export function markDifficultyComplete(
  categoryId: CategoryId,
  difficultyId: DifficultyId,
): CategoryCompletionMap {
  const next = getCategoryCompletionMap();
  next[categoryId][difficultyId] = true;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function isCategoryMastered(progress: CategoryCompletionMap, categoryId: CategoryId) {
  return DIFFICULTIES.every((difficulty) => progress[categoryId][difficulty.id]);
}

export function isCategoryUnlocked(progress: CategoryCompletionMap, categoryId: CategoryId) {
  const levelIndex = CATEGORY_SEQUENCE.indexOf(categoryId);
  if (levelIndex <= 0) return true;

  const previousCategoryId = CATEGORY_SEQUENCE[levelIndex - 1];
  return isCategoryMastered(progress, previousCategoryId);
}
