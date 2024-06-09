import ts from 'typescript';

import { getConfig } from '../utils/config';
import {
  addLeadingJSDocComment,
  type Comments,
  type ImportExportItemObject,
  ots,
} from './utils';

/**
 * Create export all declaration. Example: `export * from './y'`.
 * @param module - module to export from.
 * @returns ts.ExportDeclaration
 */
export const createExportAllDeclaration = (module: string) => {
  const config = getConfig();
  const addFileExtension = config.output.addFileExtension;
  return ts.factory.createExportDeclaration(
    undefined,
    false,
    undefined,
    ots.string(
      module.startsWith('./') && addFileExtension ? `${module}.js` : module,
    ),
  );
};

type ImportExportItem = ImportExportItemObject | string;

/**
 * Create a named export declaration. Example: `export { X } from './y'`.
 * @param items - the items to export.
 * @param module - module to export it from.
 * @returns ExportDeclaration
 */
export const createNamedExportDeclarations = (
  items: Array<ImportExportItem> | ImportExportItem,
  module: string,
): ts.ExportDeclaration => {
  items = Array.isArray(items) ? items : [items];

  const exportedTypes = Array.isArray(items) ? items : [items];
  const hasNonTypeExport = exportedTypes.some(
    (item) => typeof item !== 'object' || !item.asType,
  );
  const elements = items.map((name) => {
    const item = typeof name === 'string' ? { name } : name;
    return ots.export({
      alias: item.alias,
      asType: hasNonTypeExport && item.asType,
      name: item.name,
    });
  });
  const exportClause = ts.factory.createNamedExports(elements);
  const moduleSpecifier = ots.string(module);
  const statement = ts.factory.createExportDeclaration(
    undefined,
    !hasNonTypeExport,
    exportClause,
    moduleSpecifier,
  );
  return statement;
};

/**
 * Create a const variable export. Optionally, it can use const assertion.
 * Example: `export x = {} as const`.
 * @param constAssertion use const assertion?
 * @param expression expression for the variable.
 * @param name name of the variable.
 * @returns ts.VariableStatement
 */
export const createExportConstVariable = ({
  comment,
  constAssertion = false,
  expression,
  name,
}: {
  comment?: Comments;
  constAssertion?: boolean;
  expression: ts.Expression;
  name: string;
}): ts.VariableStatement => {
  const initializer = constAssertion
    ? ts.factory.createAsExpression(
        expression,
        ts.factory.createTypeReferenceNode('const'),
      )
    : expression;
  const declaration = ts.factory.createVariableDeclaration(
    ts.factory.createIdentifier(name),
    undefined,
    undefined,
    initializer,
  );
  const statement = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList([declaration], ts.NodeFlags.Const),
  );
  if (comment) {
    addLeadingJSDocComment(statement, comment);
  }
  return statement;
};

/**
 * Create a named import declaration. Example: `import { X } from './y'`.
 * @param items - the items to export.
 * @param module - module to export it from.
 * @returns ImportDeclaration
 */
export const createNamedImportDeclarations = (
  items: Array<ImportExportItem> | ImportExportItem,
  module: string,
): ts.ImportDeclaration => {
  const importedTypes = Array.isArray(items) ? items : [items];
  const config = getConfig();
  const addFileExtension = config?.output.addFileExtension;
  const hasNonTypeImport = importedTypes.some(
    (item) => typeof item !== 'object' || !item.asType,
  );
  const elements = importedTypes.map((name) => {
    const item = typeof name === 'string' ? { name } : name;
    return ots.import({
      alias: item.alias,
      asType: hasNonTypeImport && item.asType,
      name: item.name,
    });
  });
  const namedBindings = ts.factory.createNamedImports(elements);
  const importClause = ts.factory.createImportClause(
    !hasNonTypeImport,
    undefined,
    namedBindings,
  );

  const moduleSpecifier = ots.string(
    module.startsWith('./') && addFileExtension ? `${module}.js` : module,
  );
  const statement = ts.factory.createImportDeclaration(
    undefined,
    importClause,
    moduleSpecifier,
  );
  return statement;
};
