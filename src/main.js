#!/usr/bin/env node
const commander = require('commander');
const shell = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');
const path = require('path');
const package = require('../package');

if (!shell.which('git')) {
  console.warn('This script requires git');
  process.exit(1);
}

const gitProfileFileLocation = path.join(os.homedir(), '.gitidentities');

function getIdentities() {
  if (!fs.existsSync(gitProfileFileLocation)) {
    console.warn(chalk.yellow('no .gitidentities file found, creating one at ~/.gitidentities with your current identity'));
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

function printIdentity(identity) {
  console.info(chalk.green('Name:  ') + identity.name);
  console.info(chalk.green('Email: ') + identity.email);
  if (identity.signingKey) {
    console.info(chalk.green('key:   ') + identity.signingKey);
  }
}

commander.version(package.version);

commander
  .command('use [identity]')
  .description('use an identity')
  .option('-g, --global')
  .action((identity, options) => {
    const identities = getIdentities();
    const i = identities[identity];
    if (!i) {
      console.log('identity not found');
      process.exit(1);
    }
    setCurrentIdentity(i, options.global);
    console.info(`Identity set to ${identity}`);
  });

commander
  .command('add [name]')
  .description('add the current identity to .gitidentities')
  .action(name => {
    const identity = getCurrentIdentity();
    let identities = getIdentities();
    if (identities[name]) {
      console.warn('that identity already exists');
      process.exit(1);
    }
    identities[name] = identity;
    saveIdentities(identities);
    console.info(`Successfully added ${name}`);
  });

commander
  .command('remove [identity]')
  .description('remove an identity from .gitidentities')
  .action(identity => {
    let identities = getIdentities();
    if (!identities[identity]) {
      console.warn('that identity doesn\'t exist');
      process.exit(1);
    }
    delete identities[identity];
    saveIdentities(identities);
    console.info(`Successfully removed ${identity}`);
  });

commander
  .command('show [identity]')
  .description('show info about an identity')
  .action(identity => {
    const identities = getIdentities();
    const p = identities[identity];
    if (!p) {
      console.log('identity not found');
      process.exit(1);
    }
    printIdentity(p);
  });

commander
  .command('ls')
  .description('list all identities')
  .action(() => {
    const identities = getIdentities();
    Object.keys(identities).forEach(key => console.log(key));
  });

commander
  .command('reset')
  .description('reset identity for this project ot the global git identity')
  .action(() => {
    setCurrentIdentity(getCurrentIdentity(true));
    console.info('Identity has been reset to global identity');
  });

commander
  .command('current')
  .description('show current identity')
  .option('-g, --global')
  .action(options => {
    printIdentity(getCurrentIdentity(options.global));
  });

commander
  .command('*')
  .action(() => console.log('could not find command, use "git-identity -h" for a list of all commands'));

commander.parse(process.argv);
