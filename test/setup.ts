import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library only auto-registers its cleanup when Vitest runs with
// `globals: true`, which this project doesn't. Without it, every render in
// a file stacks up in the same document and the second test in any file
// starts failing with "Found multiple elements with the role ...".
afterEach(cleanup);
