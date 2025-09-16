#!/usr/bin/env node

// Test the statistics counting issue
const testData = {
    empty1: '',
    valid1: 'hello',
    nested: {
        empty2: '',
        valid2: 'world',
        deeper: {
            empty3: '',
            valid3: 42
        }
    }
};

// Mock the broken logic
let mockStats = { totalKeys: 0, emptyStringKeys: 0, preservedKeys: 0 };

function isEmptyString(value) {
    return typeof value === 'string' && value.trim() === '';
}

// The BROKEN countAllKeys function
function countAllKeysBroken(obj, path = '') {
    let count = 0;
    
    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            const itemPath = path ? `${path}[${index}]` : `[${index}]`;
            count += countAllKeysBroken(item, itemPath);
        });
    } else if (obj && typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
            count++; // Count this key - ISSUE: counts parent keys multiple times
            mockStats.totalKeys++;
            
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            
            if (isEmptyString(value)) {
                mockStats.emptyStringKeys++;
            }
            
            // ISSUE: This recursively counts nested keys, but parent count++ already happened
            if (typeof value === 'object' && value !== null) {
                count += countAllKeysBroken(value, currentPath);
            }
        });
    }
    
    return count;
}

console.log('🧪 Testing Statistics Issues\n');

console.log('Test Data Structure:');
console.log(JSON.stringify(testData, null, 2));

console.log('\nBroken countAllKeys results:');
mockStats = { totalKeys: 0, emptyStringKeys: 0, preservedKeys: 0 };
const brokenCount = countAllKeysBroken(testData);
console.log(`Returned count: ${brokenCount}`);
console.log(`Stats.totalKeys: ${mockStats.totalKeys}`);
console.log(`Stats.emptyStringKeys: ${mockStats.emptyStringKeys}`);

console.log('\nExpected results:');
console.log('Total keys should be: 6 (empty1, valid1, nested, empty2, valid2, deeper, empty3, valid3 = 8 keys total)');
console.log('Empty strings should be: 3 (empty1, empty2, empty3)');
console.log('Preserved should be: 5 (valid1, valid2, valid3, nested, deeper objects)');