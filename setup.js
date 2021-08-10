/*!
 * Setup script for development
 * @author amekusa (https://amekusa.com)
 * @version 1.3.1
 * @update 2021-08-10
 */

const process = require('process');
const cp = require('child_process');
const pkg = require('./package.json');

const VER = '1.3.0';
const OPTS = {
	dryRun: ''
};

function run(cmd) {
	return new Promise((resolve, reject) => {
		console.log(`>>`, cmd);
		cp.exec(cmd, {}, (err, out) => {
			return err ? reject(err) : resolve(out);
		});
	});
}

async function resolveDeps(deps) {
	let names = Object.keys(deps);
	if (!names.length) {
		console.warn(`No dependencies.`);
		return;
	}
	console.group(`Resolving dependencies:`, deps, `...`);
	try {
		// verify NPM cache
		console.log(`Verifying NPM cache ...`);
		await run(`npm cache verify`);

		// populate existent packages
		console.group(`Populating existent packages ...`);
		let l, g;
		await Promise.all([
			// locals
			run(`npm ls ${names.join(' ')} --json --depth=0`).then(out => {
				l = JSON.parse(out).dependencies || {};
			}, () => { l = {} }),
			// globals
			run(`npm ls -g ${names.join(' ')} --json --depth=0`).then(out => {
				g = JSON.parse(out).dependencies || {};
			}, () => { g = {} })
		]);
		let exist = Object.assign(g, l);
		console.log(`Existent dependencies:`, exist);
		console.groupEnd();

		// install semver
		console.log(`Installing semver ...`);
		await run(`npm i --no-save semver`);
		const semver = require('semver');

		// calculate which packages should be installed
		let installs = [];
		for (let i in deps) {
			let I = deps[i];
			if (typeof I == 'string') I = { version: I }; // support one-liner
			if (!I.version) {
				console.warn(`The dependency '${i}' is skipped due to a lack of 'version' info.`);
				continue;
			}
			if (i in exist && semver.satisfies(exist[i].version, I.version)) {
				console.log(`A sufficent version of '${i}' already exists.`, `\n - Existent: ${exist[i].version}`, `\n - Required: ${I.version}`);
				continue;
			}
			installs.push(i+'@'+I.version);
		}
		if (!installs.length) {
			console.log(`Nothing to install.`);
			return;
		}

		// install the dependencies
		console.log(`Installing ${installs.join(', ')} ...`);
		await run(`npm i --no-save${OPTS.dryRun} ${installs.join(' ')}`);
		console.log(`Installation complete.`);
		console.log(`All the dependencies have been resolved.`);

	} catch (e) {
		console.error(e);
		throw `Failed to resolve the dependencies.`;

	} finally {
		console.groupEnd();
	}
}

async function main() {
	console.group(`Running setup script ...`);
	console.log(` - File: ${process.argv[1]}`);
	console.log(` - Version: ${VER}`);

	// parse command line arguments
	for (let arg of process.argv) {
		switch (arg) {
		case '-n':
		case '--dry-run':
			OPTS.dryRun = ' --dry-run';
			console.log(` - Option: DRY-RUN`);
			break;
		}
	}

	try {
		// fetch the configuration
		let config = pkg._setup;
		if (!config) throw `Configuration missing.`;

		await resolveDeps(config.deps);
		console.log(`Setup complete.`);

	} catch (e) {
		console.error(e);
		console.error(`Setup failed.`);
		process.exit(1);
	}
}

main();
