import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sync } from 'cross-spawn';
import { describe, expect, it } from 'vitest';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const bin = path.resolve(__dirname, '../bin/index.cjs');
const input = path.resolve(__dirname, 'spec/v3.json');
const output = path.resolve(__dirname, 'generated/bin');

describe('bin', () => {
  it('supports required parameters', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('Done!');
    expect(result.stderr.toString()).toBe('');
  });

  it('generates angular client', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--client',
      'angular',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('');
    expect(result.stderr.toString()).toBe('');
  });

  it('generates axios client', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--client',
      'axios',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('');
    expect(result.stderr.toString()).toBe('');
  });

  it('generates fetch client', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--client',
      'fetch',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('');
    expect(result.stderr.toString()).toBe('');
  });

  it('generates node client', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--client',
      'node',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('');
    expect(result.stderr.toString()).toBe('');
  });

  it('generates xhr client', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--client',
      'xhr',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('');
    expect(result.stderr.toString()).toBe('');
  });

  it('supports all parameters', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--client',
      'fetch',
      '--useOptions',
      '--exportCore',
      'true',
      '--services',
      'true',
      '--types',
      'true',
      '--schemas',
      'true',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('Done!');
    expect(result.stderr.toString()).toBe('');
  });

  it('supports regexp parameters', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--services',
      '^(Simple|Types)',
      '--types',
      '^(Simple|Types)',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('Done!');
    expect(result.stderr.toString()).toBe('');
  });

  it('formats output with Prettier', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--format',
      'prettier',
    ]);
    expect(result.stdout.toString()).toContain('Prettier');
    expect(result.stderr.toString()).toBe('');
  });

  it('lints output with ESLint', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--lint',
      'eslint',
    ]);
    expect(result.stdout.toString()).toContain('ESLint');
    expect(result.stderr.toString()).toBe('');
  });

  it('throws error without parameters', () => {
    const result = sync('node', [bin, '--dry-run', 'true']);
    expect(result.stdout.toString()).toBe('');
    expect(result.stderr.toString()).toContain('Unexpected error occurred');
  });

  it('throws error with wrong parameters', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--unknown',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toBe('');
    expect(result.stderr.toString()).toContain(
      `error: unknown option '--unknown'`,
    );
  });

  it('displays help', () => {
    const result = sync('node', [bin, '--help', '--dry-run', 'true']);
    expect(result.stdout.toString()).toContain(`Usage: openapi-ts [options]`);
    expect(result.stdout.toString()).toContain(`-i, --input <value>`);
    expect(result.stdout.toString()).toContain(`-o, --output <value>`);
    expect(result.stderr.toString()).toBe('');
  });
});

describe('cli', () => {
  it('handles false booleans', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--debug',
      '--exportCore',
      'false',
      '--types',
      'false',
      '--schemas',
      'false',
      '--services',
      'false',
      '--format',
      'false',
      '--lint',
      'false',
      '--useOptions',
      'false',
      '--dry-run',
      'true',
    ]);
    expect(result.stderr.toString()).toContain('debug: true');
    expect(result.stderr.toString()).toContain('dryRun: true');
    expect(result.stderr.toString()).toContain('exportCore: false');
    expect(result.stderr.toString()).toContain('types: false');
    expect(result.stderr.toString()).toContain('services: false');
    expect(result.stderr.toString()).toContain('format: false');
    expect(result.stderr.toString()).toContain('lint: false');
    expect(result.stderr.toString()).toContain('schemas: false');
    expect(result.stderr.toString()).toContain('useOptions: false');
  });

  it('handles true booleans', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--debug',
      '--exportCore',
      'true',
      '--types',
      'true',
      '--schemas',
      'true',
      '--services',
      'true',
      '--useOptions',
      'true',
      '--dry-run',
      'true',
    ]);
    expect(result.stderr.toString()).toContain('debug: true');
    expect(result.stderr.toString()).toContain('dryRun: true');
    expect(result.stderr.toString()).toContain('exportCore: true');
    expect(result.stderr.toString()).toContain('types: true');
    expect(result.stderr.toString()).toContain('services: true');
    expect(result.stderr.toString()).toContain('schemas: true');
    expect(result.stderr.toString()).toContain('useOptions: true');
  });

  it('handles optional booleans', () => {
    const result = sync('node', [
      bin,
      '--input',
      input,
      '--output',
      output,
      '--debug',
      '--exportCore',
      '--types',
      'foo',
      '--schemas',
      '--services',
      'bar',
      '--useOptions',
      '--dry-run',
      'true',
    ]);
    expect(result.stderr.toString()).toContain('debug: true');
    expect(result.stderr.toString()).toContain('dryRun: true');
    expect(result.stderr.toString()).toContain('exportCore: true');
    expect(result.stderr.toString()).toContain('schemas: true');
    expect(result.stderr.toString()).toContain('useOptions: true');
    expect(result.stderr.toString()).toContain("types: 'foo");
    expect(result.stderr.toString()).toContain("services: 'bar'");
  });
});
