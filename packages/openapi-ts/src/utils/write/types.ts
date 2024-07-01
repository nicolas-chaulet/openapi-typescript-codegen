import {
  type Comments,
  compiler,
  type Node,
  TypeScriptFile,
} from '../../compiler';
import type { Model, OperationParameter } from '../../openApi';
import type { Method } from '../../openApi/common/interfaces/client';
import {
  getErrorResponses,
  getSuccessResponses,
} from '../../openApi/common/parser/operation';
import type { Client } from '../../types/client';
import { getConfig, isStandaloneClient } from '../config';
import { enumEntry, enumUnionType } from '../enum';
import { escapeComment } from '../escape';
import { sortByName, sorterByName } from '../sort';
import {
  operationDataTypeName,
  operationErrorTypeName,
  operationResponseTypeName,
} from './services';
import {
  setUniqueTypeName,
  type SetUniqueTypeNameResult,
  toType,
} from './type';

export interface TypesProps {
  client: Client;
  model: Model;
  onNode: (node: Node) => void;
  onRemoveNode?: VoidFunction;
}

const serviceExportedNamespace = () => '$OpenApiTs';

export const emptyModel: Model = {
  $refs: [],
  base: '',
  description: null,
  enum: [],
  enums: [],
  export: 'interface',
  imports: [],
  in: '',
  isDefinition: false,
  isNullable: false,
  isReadOnly: false,
  isRequired: false,
  link: null,
  name: '',
  properties: [],
  template: null,
  type: '',
};

const generateEnum = ({
  leadingComment,
  comments,
  meta,
  obj,
  onNode,
  ...setUniqueTypeNameArgs
}: Omit<Parameters<typeof compiler.types.enum>[0], 'name'> &
  Pick<Parameters<typeof setUniqueTypeName>[0], 'client' | 'nameTransformer'> &
  Pick<Model, 'meta'> &
  Pick<TypesProps, 'onNode'>) => {
  // generate types only for top-level models
  if (!meta) {
    return;
  }

  const { created, name } = setUniqueTypeName({
    create: true,
    meta,
    ...setUniqueTypeNameArgs,
  });
  if (created) {
    const node = compiler.types.enum({
      comments,
      leadingComment,
      name,
      obj,
    });
    onNode(node);
  }
};

export const generateType = ({
  comment,
  meta,
  onCreated,
  onNode,
  type,
  ...setUniqueTypeNameArgs
}: Omit<Parameters<typeof compiler.typedef.alias>[0], 'name'> &
  Pick<Parameters<typeof setUniqueTypeName>[0], 'client' | 'nameTransformer'> &
  Pick<Model, 'meta'> &
  Pick<TypesProps, 'onNode'> & {
    onCreated?: (name: string) => void;
  }): SetUniqueTypeNameResult => {
  // generate types only for top-level models
  if (!meta) {
    return {
      created: false,
      name: '',
    };
  }

  const result = setUniqueTypeName({
    create: true,
    meta,
    ...setUniqueTypeNameArgs,
  });
  const { created, name } = result;
  if (created) {
    const node = compiler.typedef.alias({ comment, name, type });
    onNode(node);

    onCreated?.(name);
  }
  return result;
};

const processComposition = (props: TypesProps) => {
  processType(props);
  props.model.enums.forEach((enumerator) =>
    processEnum({ ...props, model: enumerator }),
  );
};

const processEnum = ({ client, model, onNode }: TypesProps) => {
  const config = getConfig();

  const properties: Record<string | number, unknown> = {};
  const comments: Record<string | number, Comments> = {};
  model.enum.forEach((enumerator) => {
    const { key, value } = enumEntry(enumerator);
    properties[key] = value;
    const comment = enumerator.customDescription || enumerator.description;
    if (comment) {
      comments[key] = [escapeComment(comment)];
    }
  });

  const comment = [
    model.description && escapeComment(model.description),
    model.deprecated && '@deprecated',
  ];

  if (config.types.enums === 'typescript') {
    generateEnum({
      client,
      comments,
      leadingComment: comment,
      meta: model.meta,
      obj: properties,
      onNode,
    });
    return;
  }

  generateType({
    client,
    comment,
    meta: model.meta,
    onCreated: (name) => {
      // create a separate JavaScript object export
      if (config.types.enums === 'javascript') {
        const expression = compiler.types.object({
          comments,
          multiLine: true,
          obj: properties,
          unescape: true,
        });
        const node = compiler.export.const({
          comment,
          constAssertion: true,
          expression,
          name,
        });
        onNode(node);
      }
    },
    onNode,
    type: enumUnionType(model.enum),
  });
};

const processType = ({ client, model, onNode }: TypesProps) => {
  generateType({
    client,
    comment: [
      model.description && escapeComment(model.description),
      model.deprecated && '@deprecated',
    ],
    meta: model.meta,
    onNode,
    type: toType(model),
  });
};

const processModel = (props: TypesProps) => {
  switch (props.model.export) {
    case 'all-of':
    case 'any-of':
    case 'one-of':
    case 'interface':
      return processComposition(props);
    case 'enum':
      return processEnum(props);
    default:
      return processType(props);
  }
};

interface MethodMap {
  $ref?: string;
  req?: OperationParameter[];
  res?: Record<number | string, Model>;
}

type PathMap = {
  [method in Method]?: MethodMap;
};

type PathsMap = Record<string, PathMap>;

const processServiceTypes = ({
  client,
  onNode,
}: Pick<TypesProps, 'client' | 'onNode'>) => {
  const pathsMap: PathsMap = {};

  const config = getConfig();

  const isStandalone = isStandaloneClient(config);

  for (const service of client.services) {
    for (const operation of service.operations) {
      const hasReq = operation.parameters.length;
      const hasRes = operation.results.length;
      const hasErr = operation.errors.length;

      if (!hasReq && !hasRes && !hasErr) {
        continue;
      }

      if (!pathsMap[operation.path]) {
        pathsMap[operation.path] = {};
      }
      const pathMap = pathsMap[operation.path]!;

      if (!pathMap[operation.method]) {
        pathMap[operation.method] = {};
      }
      const methodMap = pathMap[operation.method]!;
      methodMap.$ref = operation.name;

      if (hasReq) {
        const bodyParameter = operation.parametersBody;

        const bodyParameters: OperationParameter = {
          mediaType: null,
          ...emptyModel,
          ...bodyParameter,
          in: 'body',
          isRequired: bodyParameter ? bodyParameter.isRequired : false,
          name: 'body',
          prop: 'body',
        };
        const headerParameters: OperationParameter = {
          ...emptyModel,
          in: 'header',
          isRequired: operation.parameters
            .filter((parameter) => parameter.in === 'header')
            .some((parameter) => parameter.isRequired),
          mediaType: null,
          name: isStandalone ? 'headers' : 'header',
          prop: isStandalone ? 'headers' : 'header',
          properties: operation.parameters
            .filter((parameter) => parameter.in === 'header')
            .sort(sorterByName),
        };
        const pathParameters: OperationParameter = {
          ...emptyModel,
          in: 'path',
          isRequired: operation.parameters
            .filter((parameter) => parameter.in === 'path')
            .some((parameter) => parameter.isRequired),
          mediaType: null,
          name: 'path',
          prop: 'path',
          properties: operation.parameters
            .filter((parameter) => parameter.in === 'path')
            .sort(sorterByName),
        };
        const queryParameters: OperationParameter = {
          ...emptyModel,
          in: 'query',
          isRequired: operation.parameters
            .filter((parameter) => parameter.in === 'query')
            .some((parameter) => parameter.isRequired),
          mediaType: null,
          name: 'query',
          prop: 'query',
          properties: operation.parameters
            .filter((parameter) => parameter.in === 'query')
            .sort(sorterByName),
        };
        const operationProperties = isStandalone
          ? [
              bodyParameters,
              headerParameters,
              pathParameters,
              queryParameters,
            ].filter(
              (param) =>
                param.properties.length ||
                param.$refs.length ||
                param.mediaType,
            )
          : sortByName([...operation.parameters]);

        methodMap.req = operationProperties;

        // create type export for operation data
        generateType({
          client,
          meta: {
            // TODO: this should be exact ref to operation for consistency,
            // but name should work too as operation ID is unique
            $ref: operation.name,
            name: operation.name,
          },
          nameTransformer: operationDataTypeName,
          onNode,
          type: toType({
            ...emptyModel,
            isRequired: true,
            properties: operationProperties,
          }),
        });
      }

      if (hasRes) {
        if (!methodMap.res) {
          methodMap.res = {};
        }

        if (Array.isArray(methodMap.res)) {
          continue;
        }

        operation.results.forEach((result) => {
          methodMap.res![result.code] = result;
        });

        const responses = getSuccessResponses(operation.results);

        // create type export for operation response
        generateType({
          client,
          meta: {
            // TODO: this should be exact ref to operation for consistency,
            // but name should work too as operation ID is unique
            $ref: operation.name,
            name: operation.name,
          },
          nameTransformer: operationResponseTypeName,
          onNode,
          type: toType({
            ...emptyModel,
            export: 'any-of',
            isRequired: true,
            properties: responses,
          }),
        });

        if (isStandaloneClient(config)) {
          const errorResults = getErrorResponses(operation.errors);
          // create type export for operation error
          generateType({
            client,
            meta: {
              // TODO: this should be exact ref to operation for consistency,
              // but name should work too as operation ID is unique
              $ref: operation.name,
              name: operation.name,
            },
            nameTransformer: operationErrorTypeName,
            onNode,
            type: toType(
              errorResults.length
                ? {
                    ...emptyModel,
                    export: 'all-of',
                    isRequired: true,
                    properties: errorResults,
                  }
                : {
                    ...emptyModel,
                    base: 'unknown',
                    isRequired: true,
                    type: 'unknown',
                  },
            ),
          });
        }
      }

      if (hasErr) {
        if (!methodMap.res) {
          methodMap.res = {};
        }

        if (Array.isArray(methodMap.res)) {
          continue;
        }

        operation.errors.forEach((error) => {
          methodMap.res![error.code] = error;
        });
      }
    }
  }

  const properties = Object.entries(pathsMap).map(([path, pathMap]) => {
    const pathParameters = Object.entries(pathMap)
      .map(([_method, methodMap]) => {
        const method = _method as Method;

        let methodParameters: Model[] = [];

        if (methodMap.req) {
          const operationName = methodMap.$ref!;
          const { name: base } = setUniqueTypeName({
            client,
            meta: {
              // TODO: this should be exact ref to operation for consistency,
              // but name should work too as operation ID is unique
              $ref: operationName,
              name: operationName,
            },
            nameTransformer: operationDataTypeName,
          });
          const reqKey: Model = {
            ...emptyModel,
            base,
            export: 'reference',
            isRequired: true,
            name: 'req',
            properties: [],
            type: base,
          };
          methodParameters = [...methodParameters, reqKey];
        }

        if (methodMap.res) {
          const reqResParameters = Object.entries(methodMap.res).map(
            ([code, base]) => {
              // TODO: move query params into separate query key
              const value: Model = {
                ...emptyModel,
                ...base,
                isRequired: true,
                name: String(code),
              };
              return value;
            },
          );

          const resKey: Model = {
            ...emptyModel,
            isRequired: true,
            name: 'res',
            properties: reqResParameters,
          };
          methodParameters = [...methodParameters, resKey];
        }

        const methodKey: Model = {
          ...emptyModel,
          isRequired: true,
          name: method.toLocaleLowerCase(),
          properties: methodParameters,
        };
        return methodKey;
      })
      .filter(Boolean);
    const pathKey: Model = {
      ...emptyModel,
      isRequired: true,
      name: `'${path}'`,
      properties: pathParameters as Model[],
    };
    return pathKey;
  });

  generateType({
    client,
    meta: {
      $ref: '@hey-api/openapi-ts',
      name: serviceExportedNamespace(),
    },
    onNode,
    type: toType({
      ...emptyModel,
      properties,
    }),
  });
};

export const processTypes = async ({
  client,
  files,
}: {
  client: Client;
  files: Record<string, TypeScriptFile>;
}): Promise<void> => {
  const onNode: TypesProps['onNode'] = (node) => {
    files.types?.add(node);
  };

  for (const model of client.models) {
    processModel({ client, model, onNode });
  }

  processServiceTypes({ client, onNode });
};
