import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  checkPasswordCriteria,
  isPasswordValid,
} from '../src/utils/validation';
import { parseSupabaseError } from '../src/utils/errorHandler';
import { GENERIC_AUTH_ERROR } from '../src/constants/errors';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('--- 1. Testing SignIn Validation ---');
assert(signInSchema.safeParse({ email: 'valid@example.com', password: 'secretpassword' }).success, 'Valid sign in credentials pass');
assert(!signInSchema.safeParse({ email: 'not-an-email', password: 'secretpassword' }).success, 'Invalid email fails');
assert(!signInSchema.safeParse({ email: 'valid@example.com', password: '' }).success, 'Empty password fails');

console.log('\n--- 2. Testing Password Criteria & SignUp ---');
assert(!isPasswordValid('Sho1!ab'), 'Password exactly 7 chars fails (needs min 8)');
assert(!isPasswordValid('alllowercase1!'), 'Missing uppercase fails');
assert(!isPasswordValid('ALLUPPERCASE1!'), 'Missing lowercase fails');
assert(!isPasswordValid('NoDigitHere!a'), 'Missing digit fails');
assert(!isPasswordValid('NoSymbolHere1a'), 'Missing symbol fails');
assert(isPasswordValid('BankPass123!'), 'Password with min 8, upper, lower, digit, symbol passes');

const criteria = checkPasswordCriteria('BankPass123!');
assert(criteria.minLength === true, 'Criteria minLength true');
assert(criteria.hasUppercase === true, 'Criteria hasUppercase true');
assert(criteria.hasLowercase === true, 'Criteria hasLowercase true');
assert(criteria.hasDigit === true, 'Criteria hasDigit true');
assert(criteria.hasSymbol === true, 'Criteria hasSymbol true');

assert(
  signUpSchema.safeParse({
    name: 'Juan Perez',
    email: 'juan@ibank.com',
    password: 'BankPass123!',
    termsAccepted: true,
  }).success,
  'Valid sign up form passes'
);

assert(
  !signUpSchema.safeParse({
    name: 'Juan Perez',
    email: 'juan@ibank.com',
    password: 'BankPass123!',
    termsAccepted: false,
  }).success,
  'Sign up with terms unaccepted fails'
);

console.log('\n--- 3. Testing Change Password Schema ---');
assert(
  changePasswordSchema.safeParse({
    password: 'NewStrongPassword1!',
    confirmPassword: 'NewStrongPassword1!',
  }).success,
  'Matching strong passwords pass'
);

assert(
  !changePasswordSchema.safeParse({
    password: 'NewStrongPassword1!',
    confirmPassword: 'MismatchPassword1!',
  }).success,
  'Mismatched passwords fail'
);

console.log('\n--- 4. Testing Supabase Error Handler & Anti-enumeration ---');
const invalidCreds = parseSupabaseError({ message: 'Invalid login credentials' });
assert(invalidCreds.message === GENERIC_AUTH_ERROR, 'Anti-enumeration generic error on invalid credentials');
assert(invalidCreds.isGenericAuthError === true, 'Flagged as generic auth error');

const rateLimit429 = parseSupabaseError({ status: 429, message: 'Too many requests' });
assert(rateLimit429.isRateLimited === true, 'HTTP 429 flagged as rate limited');
assert(rateLimit429.message.includes('60 segundos'), 'Rate limit message mentions 60 seconds');

const emailUnconfirmed = parseSupabaseError({ code: 'email_not_confirmed' });
assert(emailUnconfirmed.isEmailUnconfirmed === true, 'Email unconfirmed properly identified');

const unknownError = parseSupabaseError({ message: 'some cryptic backend error' });
assert(typeof unknownError.message === 'string' && unknownError.message.length > 0, 'Unknown error gets friendly message');

console.log(`\n================================`);
console.log(`Total tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log(`================================`);

if (failed > 0) {
  process.exit(1);
}
