#!/usr/bin/env node
const program = require('caporal');
const shell = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');
const version = require('../package').version;

if (!shell.which('git')) {
  console.warn('This script requires git');
  process.exit(1);
}

const gitProfileFileLocation = path.join(os.homedir(), '.gitidentities');

function getIdentities() {
  if (!fs.existsSync(gitProfileFileLocation)) {
    console.warn(chalk.yellow('no .gitidentities file found, creating one at ~/.gitidentities with your current identity\n'));
    saveIdentities({ default: getCurrentIdentity() });
  }
  const fileRaw = fs.readFileSync(gitProfileFileLocation);
  return JSON.parse(fileRaw.toString('utf8'));
}

function saveIdentities(identities) {
  fs.writeFileSync(gitProfileFileLocation, JSON.stringify(identities));
}

function getCurrentIdentity(global = false) {
  return {
    name: shell.exec(`git config${global ? ' --global' : ''} user.name`, { silent: true }).stdout.toString().replace('\n', ''),
    email: shell.exec(`git config${global ? ' --global' : ''} user.email`, { silent: true }).stdout.toString().replace('\n', ''),
    signingKey: shell.exec(`git config${global ? ' --global' : ''} user.signingkey`, { silent: true }).stdout.toString().replace('\n', '')
  };
}

function setCurrentIdentity(identity, global = false) {
  shell.exec(`git config${global ? ' --global' : ''} user.name "${identity.name}"`, { silent: true });
  shell.exec(`git config${global ? ' --global' : ''} user.email "${identity.email}"`, { silent: true });
  if (identity.signingKey) {
    shell.exec(`git config${global ? ' --global' : ''} user.signingkey "${identity.signingKey}"`, { silent: true });
  } else {
    shell.exec(`git config${global ? ' --global' : ''} --unset user.signingkey`, { silent: true });
  }
}

function printIdentity(logger, identity) {
  logger.info(chalk.green('Name:  ') + identity.name);
  logger.info(chalk.green('Email: ') + identity.email);
  if (identity.signingKey) {
    logger.info(chalk.green('key:   ') + identity.signingKey);
  }
}

program.version(version);

program
  .command('use', 'use an identity')
  .argument('<identity>', 'identity name', Object.keys(getIdentities()))
  .option('-g, --global', 'global git config')
  .action((args, options, logger) => {
    const identities = getIdentities();
    const i = identities[args.identity];
    if (!i) {
      logger.warn('identity not found');
      process.exit(1);
    }
    setCurrentIdentity(i, options.global);
    logger.info(`Identity set to ${args.identity}`);
  });

program
  .command('add', 'add the current identity to .gitidentities')
  .argument('<name>', 'name for the identity')
  .action((args, options, logger) => {
    const identity = getCurrentIdentity();
    let identities = getIdentities();
    if (identities[args.name]) {
      logger.warn('that identity already exists');
      process.exit(1);
    }
    identities[args.name] = identity;
    saveIdentities(identities);
    logger.info(`Successfully added ${args.name}`);
  });

program
  .command('remove', 'remove an identity from .gitidentities')
  .argument('<identity>', 'identity name', Object.keys(getIdentities()))
  .action((args, options, logger) => {
    let identities = getIdentities();
    if (!identities[args.identity]) {
      logger.warn('that identity doesn\'t exist');
      process.exit(1);
    }
    delete identities[args.identity];
    saveIdentities(identities);
    logger.info(`Successfully removed ${args.identity}`);
  });

program
  .command('show', 'show info about an identity')
  .argument('<identity>', 'identity name', Object.keys(getIdentities()))
  .action((args, options, logger) => {
    const identities = getIdentities();
    const identity = identities[args.identity];
    if (!identity) {
      logger.warn('identity not found');
      process.exit(1);
    }
    printIdentity(logger, identity);
  });

program
  .command('ls', 'list all identities')
  .action((args, options, logger) => {
    const identities = getIdentities();
    Object.keys(identities).forEach(key => logger.log(key));
  });

program
  .command('reset', 'reset identity for this project to the global git identity')
  .action((args, options, logger) => {
    shell.exec('git config --unset user.name', { silent: true });
    shell.exec('git config --unset user.email', { silent: true });
    shell.exec('git config --unset user.signingkey', { silent: true });
    logger.info('Identity has been reset to global identity');
  });

program
  .command('current', 'show current identity')
  .option('-g, --global', 'global git config')
  .action((args, options, logger) => {
    printIdentity(logger, getCurrentIdentity(options.global));
  });

program.parse(process.argv);
