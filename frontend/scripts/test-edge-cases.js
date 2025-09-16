#!/usr/bin/env node

/**
 * Test edge cases for the empty removal logic
 */

// Test data with edge cases
const edgeCaseData = {
    emptyString: '',
    whitespaceString: '   ',
    zeroNumber: 0,
    falseBoolean: false,
    nullValue: null,
    undefinedValue: undefined,
    emptyObject: {},
    emptyArray: [],
    arrayWithEmpty: ['valid', '', 'also valid'],
    nestedEmpty: {
        level1: {
            empty: '',
            valid: 'text'
        }
    }
};

function isEmptyString(value) {
    return typeof value === 'string' && value.trim() === '';
}

function removeEmptyStringsTest(obj, path = '', operations = []) {
    if (Array.isArray(obj)) {
        // Arrays: process items but don't remove array items
        obj.forEach((item, index) => {
            const itemPath = path ? `${path}[${index}]` : `[${index}]`;
            if (typeof item === 'object' && item !== null) {
                removeEmptyStringsTest(item, itemPath, operations);
            }
        });
    } else if (obj && typeof obj === 'object' && obj !== null) {
        // Objects: mark empty strings for removal
        const keysToRemove = [];
        
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            
            if (isEmptyString(value)) {
                keysToRemove.push(key);
                operations.push({
                    action: 'remove',
                    path: currentPath,
                    value: `"${value}"`
                });
                console.log(`  Would remove: ${currentPath} = "${value}"`);
                
            } else if (typeof value === 'object' && value !== null) {
                removeEmptyStringsTest(value, currentPath, operations);
            }
        });
    }
    
    return operations;
}

console.log('🧪 Testing Edge Cases\n');

console.log('Test Data:');
console.log(JSON.stringify(edgeCaseData, null, 2));

console.log('\nProcessing results:');
const operations = removeEmptyStringsTest(edgeCaseData);

console.log(`\nSummary: ${operations.length} operations would be performed`);
operations.forEach(op => {
    console.log(`- ${op.action}: ${op.path} = ${op.value}`);
});

console.log('\nShould preserve:');
console.log('- zeroNumber: 0');
console.log('- falseBoolean: false');  
console.log('- nullValue: null');
console.log('- emptyObject: {}');
console.log('- emptyArray: []');
console.log('- arrayWithEmpty: ["valid", "", "also valid"] (but empty string inside should be noted, not removed from array)');
console.log('- All valid strings');