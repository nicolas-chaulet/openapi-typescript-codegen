export interface ClientConfig {
  /**
   * Manually set base in OpenAPI config instead of inferring from server value
   * @deprecated
   */
  base?: string;
  /**
   * HTTP client to generate
   * @default 'fetch'
   */
  client?:
    | '@hey-api/client-axios'
    | '@hey-api/client-fetch'
    | 'angular'
    | 'axios'
    | 'fetch'
    | 'node'
    | 'xhr';
  /**
   * Run in debug mode?
   * @default false
   */
  debug?: boolean;
  /**
   * Skip writing files to disk?
   * @default false
   */
  dryRun?: boolean;
  /**
   * Generate core client classes?
   * @default true
   */
  exportCore?: boolean;
  /**
   * The relative location of the OpenAPI spec
   */
  input: string | Record<string, unknown>;
  /**
   * Custom client class name
   * @deprecated
   */
  name?: string;
  /**
   * The relative location of the output directory
   */
  output:
    | string
    | {
        /**
         * Process output folder with formatter?
         * @default false
         */
        format?: 'biome' | 'prettier' | false;
        /**
         * Process output folder with linter?
         * @default false
         */
        lint?: 'biome' | 'eslint' | false;
        /**
         * The relative location of the output directory
         */
        path: string;

        /**
         * Add file extension to generated files (e.g. '.js') for moduleResolution compatibility (node16/nodenext)
         */
        addFileExtension?: boolean;
      };
  /**
   * Path to custom request file
   * @deprecated
   */
  request?: string;
  /**
   * Generate JSON schemas?
   * @default true
   */
  schemas?:
    | boolean
    | {
        /**
         * Generate JSON schemas?
         * @default true
         */
        export?: boolean;
        /**
         * Choose schema type to generate. Select 'form' if you don't want
         * descriptions to reduce bundle size and you plan to use schemas
         * for form validation
         * @default 'json'
         */
        type?: 'form' | 'json';
      };
  /**
   * Generate services?
   * @default true
   */
  services?:
    | boolean
    | string
    | {
        /**
         * Group operation methods into service classes? When enabled, you can
         * select which classes to export with `services.include` and/or
         * transform their names with `services.name`.
         *
         * Note that by enabling this option, your services will **NOT**
         * support {@link https://developer.mozilla.org/docs/Glossary/Tree_shaking tree-shaking}.
         * For this reason, it is disabled by default.
         * @default false
         */
        asClass?: boolean;
        /**
         * Generate services?
         * @default true
         */
        export?: boolean;
        /**
         * Include only service classes with names matching regular expression
         *
         * This option has no effect if `services.asClass` is `false`.
         */
        include?: string;
        /**
         * Customize the generated service class names. The name variable is
         * obtained from your OpenAPI specification tags.
         *
         * This option has no effect if `services.asClass` is `false`.
         * @default '{{name}}Service'
         */
        name?: string;
        /**
         * Use operation ID to generate operation names?
         * @default true
         */
        operationId?: boolean;
        /**
         * Define shape of returned value from service calls
         * @default 'body'
         * @deprecated
         */
        response?: 'body' | 'response';
      };
  /**
   * Generate types?
   * @default true
   */
  types?:
    | boolean
    | string
    | {
        /**
         * Output Date instead of string for format "date-time"
         * @default false
         */
        dates?: boolean;
        /**
         * Generate enum definitions?
         * @default false
         */
        enums?: 'javascript' | 'typescript' | false;
        /**
         * Generate types?
         * @default true
         */
        export?: boolean;
        /**
         * Include only types matching regular expression
         */
        include?: string;
        /**
         * Use your preferred naming pattern
         * @default 'preserve'
         */
        name?: 'PascalCase' | 'preserve';
      };
  /**
   * Use options or arguments functions
   * @deprecated
   * @default true
   */
  useOptions?: boolean;
}

// export type UserConfig = ClientConfig | Array<ClientConfig>
export type UserConfig = ClientConfig;

export type Config = Omit<
  Required<ClientConfig>,
  'base' | 'name' | 'output' | 'request' | 'schemas' | 'services' | 'types'
> &
  Pick<ClientConfig, 'base' | 'name' | 'request'> & {
    output: Extract<Required<ClientConfig>['output'], object>;
    schemas: Extract<Required<ClientConfig>['schemas'], object>;
    services: Extract<Required<ClientConfig>['services'], object>;
    types: Extract<Required<ClientConfig>['types'], object>;
  };
