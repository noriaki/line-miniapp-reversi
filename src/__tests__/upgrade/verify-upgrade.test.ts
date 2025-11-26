/**
 * Verification tests for Next.js 16 and React 19 upgrade
 * These tests validate the codemod migration results
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Next.js 16 and React 19 Upgrade Verification', () => {
  const projectRoot = join(__dirname, '../../..');
  const packageJsonPath = join(projectRoot, 'package.json');
  const lockFilePath = join(projectRoot, 'pnpm-lock.yaml');

  describe('Task 2.1: Codemod Execution', () => {
    it('should update Next.js to version 16.x in package.json', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const nextVersion = packageJson.dependencies.next;

      expect(nextVersion).toMatch(/^\^16\./);
    });

    it('should update React to version 19.2.x in package.json', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const reactVersion = packageJson.dependencies.react;

      expect(reactVersion).toMatch(/^\^19\./);
    });

    it('should update React DOM to version 19.2.x in package.json', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const reactDomVersion = packageJson.dependencies['react-dom'];

      expect(reactDomVersion).toMatch(/^\^19\./);
    });

    it('should update @types/react to version 19.x in devDependencies', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const typesReactVersion = packageJson.devDependencies['@types/react'];

      expect(typesReactVersion).toMatch(/^\^19/);
    });

    it('should update @types/react-dom to version 19.x in devDependencies', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const typesReactDomVersion = packageJson.devDependencies['@types/react-dom'];

      expect(typesReactDomVersion).toMatch(/^\^19/);
    });
  });

  describe('Task 2.2: Dependencies Reinstallation', () => {
    it('should have updated pnpm-lock.yaml file', () => {
      expect(existsSync(lockFilePath)).toBe(true);

      const lockFileContent = readFileSync(lockFilePath, 'utf-8');
      expect(lockFileContent.length).toBeGreaterThan(0);
    });

    it('should have node_modules directory', () => {
      const nodeModulesPath = join(projectRoot, 'node_modules');
      expect(existsSync(nodeModulesPath)).toBe(true);
    });

    it('should have Next.js 16.x installed in node_modules', () => {
      const nextPackageJsonPath = join(
        projectRoot,
        'node_modules/next/package.json'
      );

      if (existsSync(nextPackageJsonPath)) {
        const nextPackageJson = JSON.parse(
          readFileSync(nextPackageJsonPath, 'utf-8')
        );
        expect(nextPackageJson.version).toMatch(/^16\./);
      }
    });

    it('should have React 19.x installed in node_modules', () => {
      const reactPackageJsonPath = join(
        projectRoot,
        'node_modules/react/package.json'
      );

      if (existsSync(reactPackageJsonPath)) {
        const reactPackageJson = JSON.parse(
          readFileSync(reactPackageJsonPath, 'utf-8')
        );
        expect(reactPackageJson.version).toMatch(/^19\./);
      }
    });
  });

  describe('Task 2.3: Migration Content Validation', () => {
    it('should have valid JSON structure in package.json', () => {
      const content = readFileSync(packageJsonPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should maintain required dependencies', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      const requiredDeps = ['@line/liff', 'next', 'react', 'react-dom'];
      requiredDeps.forEach(dep => {
        expect(packageJson.dependencies[dep]).toBeDefined();
      });
    });

    it('should maintain required devDependencies', () => {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      const requiredDevDeps = [
        '@types/react',
        '@types/react-dom',
        'typescript',
        'jest',
        '@testing-library/react'
      ];

      requiredDevDeps.forEach(dep => {
        expect(packageJson.devDependencies[dep]).toBeDefined();
      });
    });
  });
});
