import { filePath, generatedFileName, TypeScriptFile } from '../../compiler';
import type { OpenApi } from '../../openApi';
import type { Client } from '../../types/client';
import { getConfig } from '../config';
import { serviceExportedNamespace, type Templates } from '../handlebars';
import { unique } from '../unique';

/**
 * Generate Services using the Handlebar template and write to disk.
 * @param openApi {@link OpenApi} Dereferenced OpenAPI specification
 * @param outputPath Directory to write the generated files to
 * @param client Client containing models, schemas, and services
 * @param templates The loaded handlebar templates
 */
export const writeServices = async (
    openApi: OpenApi,
    outputPath: string,
    client: Client,
    templates: Templates
): Promise<void> => {
    const config = getConfig();

    const fileServices = new TypeScriptFile({ path: filePath(outputPath, 'services.ts') });

    let imports: string[] = [];
    let results: string[] = [];

    for (const service of client.services) {
        const result = templates.exports.service({
            $config: config,
            ...service,
        });
        const exported = serviceExportedNamespace();
        imports = [...imports, exported];
        results = [...results, result];
    }

    // Import required packages and core files.
    if (config.client === 'angular') {
        fileServices.addNamedImport('Injectable', '@angular/core');
        if (config.name === undefined) {
            fileServices.addNamedImport('HttpClient', '@angular/common/http');
        }
        fileServices.addNamedImport({ isTypeOnly: true, name: 'Observable' }, 'rxjs');
    } else {
        fileServices.addNamedImport({ isTypeOnly: true, name: 'CancelablePromise' }, './core/CancelablePromise');
    }
    if (config.serviceResponse === 'response') {
        fileServices.addNamedImport({ isTypeOnly: true, name: 'ApiResult' }, './core/ApiResult');
    }
    if (config.name) {
        fileServices.addNamedImport(
            { isTypeOnly: config.client !== 'angular', name: 'BaseHttpRequest' },
            './core/BaseHttpRequest'
        );
    } else {
        fileServices.addNamedImport('OpenAPI', './core/OpenAPI');
        fileServices.addNamedImport({ alias: '__request', name: 'request' }, './core/request');
    }

    fileServices.addNamedImport({ isTypeOnly: true, name: 'ApiRequestOptions' }, './core/ApiRequestOptions');
    fileServices.addNamedImport('mergeDeep', './core/request');

    // Import all models required by the services.
    const models = imports.filter(unique).map(imp => ({ isTypeOnly: true, name: imp }));
    fileServices.addNamedImport(models, generatedFileName('./models'));

    fileServices.add(...results);

    if (config.exportServices) {
        fileServices.write('\n\n');
    }
};
