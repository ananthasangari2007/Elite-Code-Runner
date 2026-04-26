export type Question = {
  q: string;
  options: string[];
  answer: number; // index 0..3
  category: "Arrays" | "Strings" | "Functions";
  code?: string;
};

export const QUESTIONS: Question[] = [
  // Arrays 1-10
  {
    q: "What is the index of the first element in an array?",
    options: ["1", "0", "-1", "Depends on compiler"],
    answer: 1,
    category: "Arrays",
  },
  {
    q: "Which declaration is correct?",
    options: ["int arr;", "int arr[5];", "array int arr[5];", "int arr(5);"],
    answer: 1,
    category: "Arrays",
  },
  {
    q: "What is the size of int arr[10]? (Assume int = 4 bytes)",
    options: ["10", "20", "40", "4"],
    answer: 2,
    category: "Arrays",
  },
  {
    q: "Which is used to access array elements?",
    options: ["()", "{}", "[]", "<>"],
    answer: 2,
    category: "Arrays",
  },
  {
    q: "What is the output?",
    code: 'int a[3]={1,2,3};\nprintf("%d", a[1]);',
    options: ["1", "2", "3", "Error"],
    answer: 1,
    category: "Arrays",
  },
  {
    q: "Arrays are stored in:",
    options: ["Random order", "Contiguous memory", "Stack only", "Heap only"],
    answer: 1,
    category: "Arrays",
  },
  {
    q: "What is the default value of an uninitialized local array?",
    options: ["0", "Garbage", "NULL", "1"],
    answer: 1,
    category: "Arrays",
  },
  {
    q: "How many elements in int a[5]?",
    options: ["4", "5", "6", "Undefined"],
    answer: 1,
    category: "Arrays",
  },
  {
    q: "Which loop is best for array traversal?",
    options: ["if", "while", "for", "switch"],
    answer: 2,
    category: "Arrays",
  },
  {
    q: "Multidimensional arrays are:",
    options: ["Single indexed", "Multiple indexed", "No index", "Invalid"],
    answer: 1,
    category: "Arrays",
  },

  // Strings 11-20
  {
    q: "A string in C ends with:",
    options: ["\\n", "\\0", "EOF", "NULL"],
    answer: 1,
    category: "Strings",
  },
  {
    q: "Which header is required for string functions?",
    options: ["stdio.h", "stdlib.h", "string.h", "math.h"],
    answer: 2,
    category: "Strings",
  },
  {
    q: "Which function finds string length?",
    options: ["len()", "strlen()", "size()", "count()"],
    answer: 1,
    category: "Strings",
  },
  {
    q: "What is the output?",
    code: 'char s[]="Hi";\nprintf("%d", strlen(s));',
    options: ["1", "2", "3", "Error"],
    answer: 1,
    category: "Strings",
  },
  {
    q: "Which function copies a string?",
    options: ["strcpy()", "strcat()", "strcmp()", "strlen()"],
    answer: 0,
    category: "Strings",
  },
  {
    q: "strcmp() returns 0 when:",
    options: ["Strings differ", "Strings same", "Error", "NULL"],
    answer: 1,
    category: "Strings",
  },
  {
    q: "What is the output?",
    code: 'char s[10]="Hello";\nprintf("%c", s[1]);',
    options: ["H", "e", "l", "o"],
    answer: 1,
    category: "Strings",
  },
  {
    q: "Which function concatenates strings?",
    options: ["strcat()", "strcpy()", "strlen()", "strcmp()"],
    answer: 0,
    category: "Strings",
  },
  {
    q: 'What is the size of "Hello"? (including \\0)',
    options: ["5", "6", "4", "7"],
    answer: 1,
    category: "Strings",
  },
  {
    q: "gets() is:",
    options: ["Safe", "Unsafe", "Fast", "Recommended"],
    answer: 1,
    category: "Strings",
  },

  // Functions 21-30
  {
    q: "A function is:",
    options: ["Variable", "Block of code", "Loop", "Operator"],
    answer: 1,
    category: "Functions",
  },
  {
    q: "Which is correct function syntax?",
    options: ["int func(){}", "func int(){}", "int = func()", "func() int{}"],
    answer: 0,
    category: "Functions",
  },
  {
    q: "What is the return type of main()?",
    options: ["void", "int", "float", "char"],
    answer: 1,
    category: "Functions",
  },
  {
    q: "What is a function prototype?",
    options: ["Definition", "Declaration", "Call", "Loop"],
    answer: 1,
    category: "Functions",
  },
  {
    q: "Which keyword returns a value?",
    options: ["break", "return", "exit", "stop"],
    answer: 1,
    category: "Functions",
  },
  {
    q: "What is recursion?",
    options: ["Loop", "Function calling itself", "Array", "Pointer"],
    answer: 1,
    category: "Functions",
  },
  {
    q: "Default return type (old C)?",
    options: ["void", "int", "char", "float"],
    answer: 1,
    category: "Functions",
  },
  {
    q: "Arguments passed by value means:",
    options: ["Original changes", "Copy passed", "Pointer used", "Error"],
    answer: 1,
    category: "Functions",
  },
  {
    q: "What is the output?",
    code: 'int f(int x){ return x*x; }\nprintf("%d", f(3));',
    options: ["3", "6", "9", "Error"],
    answer: 2,
    category: "Functions",
  },
  {
    q: "Which allows no return value?",
    options: ["int", "void", "char", "float"],
    answer: 1,
    category: "Functions",
  },
];
