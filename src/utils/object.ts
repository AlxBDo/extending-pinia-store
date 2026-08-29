import type { Comparison, ComparisonNumber } from "../types/comparison";


const comparisonNumberFunctions: Record<ComparisonNumber, (num1: number, num2: number) => boolean> = {
    '>': (num1: number, num2: number) => num1 > num2,
    '>=': (num1: number, num2: number) => num1 >= num2,
    '<': (num1: number, num2: number) => num1 < num2,
    '<=': (num1: number, num2: number) => num1 <= num2
}

export function arrayObjectFindAllBy<T extends object>(
    arrayOfObject: T[],
    findBy: Partial<T>,
    comparison: Comparison = 'strict'
): T[] {
    return arrayOfObject.filter(
        (item: T) => (Object.entries(findBy) as [keyof T, T[keyof T]][]).every(
            ([key, expectedValue]) => {
                const itemValue = item[key]

                if (typeof expectedValue === 'string') {
                    const normalizedExpectedValue = expectedValue.toLowerCase()
                    const normalizedItemValue = typeof itemValue === 'string'
                        ? itemValue.toLowerCase()
                        : itemValue

                    return comparison === 'strict'
                        ? normalizedItemValue === normalizedExpectedValue
                        : typeof normalizedItemValue === 'string' && normalizedItemValue.includes(normalizedExpectedValue)
                }

                if (typeof expectedValue === 'number' && typeof itemValue === 'number' && comparison !== 'strict' && comparison !== 'partial') {
                    return comparisonNumberFunctions[comparison as ComparisonNumber](itemValue, expectedValue)
                }

                return itemValue === expectedValue
            }
        )
    )
}

export function arrayObjectFindBy<T extends object>(arrayOfObject: T[], findBy: Partial<T>): T | undefined {
    return arrayOfObject.find(
        (item: T) => (Object.entries(findBy) as [keyof T, T[keyof T]][]).every(
            ([key, expectedValue]) => item[key] === expectedValue
        )
    )
}