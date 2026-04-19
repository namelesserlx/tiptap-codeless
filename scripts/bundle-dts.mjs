import { mkdir, writeFile } from 'fs/promises';
import process from 'node:process';
import { dirname, resolve } from 'path';
import { generateDtsBundle } from 'dts-bundle-generator';

/**
 * Generate a single bundled declaration file for a package entrypoint.
 *
 * @param {{
 *   project: string;
 *   entry: string;
 *   output: string;
 *   externalImports?: string[];
 * }} options
 */
export async function bundleDeclarations(options) {
    const project = resolve(options.project);
    const entry = resolve(options.entry);
    const output = resolve(options.output);

    const bundles = generateDtsBundle(
        [
            {
                filePath: entry,
                libraries: options.externalImports?.length
                    ? {
                          importedLibraries: options.externalImports,
                      }
                    : undefined,
                output: {
                    noBanner: true,
                    sortNodes: true,
                },
            },
        ],
        {
            preferredConfigPath: project,
        }
    );

    if (bundles.length !== 1 || !bundles[0]) {
        throw new Error(
            `Expected exactly one bundled declaration for ${entry}, received ${bundles.length}.`
        );
    }

    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, `${bundles[0].trim()}\n`, 'utf8');
}

function readCliArgs(argv) {
    /** @type {{ project?: string; entry?: string; output?: string; externalImports: string[] }} */
    const parsed = {};
    parsed.externalImports = [];

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        const next = argv[index + 1];

        if ((arg === '--project' || arg === '-p') && next) {
            parsed.project = next;
            index += 1;
            continue;
        }

        if ((arg === '--entry' || arg === '-e') && next) {
            parsed.entry = next;
            index += 1;
            continue;
        }

        if ((arg === '--output' || arg === '-o') && next) {
            parsed.output = next;
            index += 1;
            continue;
        }

        if (arg === '--external-import' && next) {
            parsed.externalImports.push(
                ...next
                    .split(',')
                    .map((value) => value.trim())
                    .filter(Boolean)
            );
            index += 1;
        }
    }

    return parsed;
}

async function main() {
    const parsed = readCliArgs(process.argv.slice(2));

    if (!parsed.project || !parsed.entry || !parsed.output) {
        throw new Error(
            'Usage: node scripts/bundle-dts.mjs --project <tsconfig> --entry <src/index.ts> --output <dist/index.d.ts>'
        );
    }

    await bundleDeclarations({
        project: parsed.project,
        entry: parsed.entry,
        output: parsed.output,
        externalImports: parsed.externalImports,
    });
}

const isCliInvocation = process.argv[1] ? resolve(process.argv[1]) === resolve(import.meta.filename) : false;

if (isCliInvocation) {
    main().catch((error) => {
        globalThis.console.error(error);
        process.exitCode = 1;
    });
}
