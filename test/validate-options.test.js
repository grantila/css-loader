import { getCompiler, compile } from './helpers/index';

describe('validate options', () => {
  const tests = {
    url: {
      success: [true, false, () => {}],
      failure: ['true'],
    },
    import: {
      success: [true, false, () => {}],
      failure: ['true'],
    },
    icss: {
      success: [true, false],
      failure: ['true', 1],
    },
    modules: {
      success: [
        true,
        false,
        'global',
        'local',
        'pure',
        { compileType: 'module' },
        { compileType: 'icss' },
        { mode: 'global' },
        { mode: 'local' },
        { mode: 'pure' },
        { mode: () => 'local' },
        { localIdentName: '[path][name]__[local]--[hash:base64:5]' },
        { localIdentContext: 'context' },
        { localIdentHashPrefix: 'hash' },
        {
          getLocalIdent: (loaderContext, localIdentName, localName) =>
            localName,
        },
        { localIdentRegExp: 'page-(.*)\\.js' },
        { localIdentRegExp: /page-(.*)\.js/ },
        { exportGlobals: true },
        { auto: true },
        { auto: false },
        { auto: /custom-regex/ },
        { auto: () => true },
        { exportLocalsConvention: 'asIs' },
        { exportLocalsConvention: 'camelCase' },
        { exportLocalsConvention: 'camelCaseOnly' },
        { exportLocalsConvention: 'dashes' },
        { exportLocalsConvention: 'dashesOnly' },
        { namedExport: true },
        { namedExport: false },
        { exportOnlyLocals: true },
        { exportOnlyLocals: false },
      ],
      failure: [
        'true',
        'globals',
        'locals',
        'pures',
        { compileType: 'unknown' },
        { mode: true },
        { mode: 'globals' },
        { mode: 'locals' },
        { mode: 'pures' },
        { localIdentName: true },
        { localIdentContext: true },
        { localIdentHashPrefix: true },
        { getLocalIdent: [] },
        { localIdentRegExp: true },
        { exportGlobals: 'invalid' },
        { auto: 'invalid' },
        { exportLocalsConvention: 'unknown' },
        { namedExport: 'invalid' },
        { exportOnlyLocals: 'invalid' },
      ],
    },
    sourceMap: {
      success: [true, false],
      failure: ['true'],
    },
    importLoaders: {
      success: [false, 0, 1, 2, '1'],
      failure: [2.5],
    },
    esModule: {
      success: [true, false],
      failure: ['true'],
    },
    unknown: {
      success: [],
      failure: [1, true, false, 'test', /test/, [], {}, { foo: 'bar' }],
    },
  };

  function stringifyValue(value) {
    if (
      Array.isArray(value) ||
      (value && typeof value === 'object' && value.constructor === Object)
    ) {
      return JSON.stringify(value);
    }

    return value;
  }

  async function createTestCase(key, value, type) {
    it(`should ${
      type === 'success' ? 'successfully validate' : 'throw an error on'
    } the "${key}" option with "${stringifyValue(value)}" value`, async () => {
      const options = { [key]: value };

      if (
        key === 'modules' &&
        typeof value === 'object' &&
        value.namedExport === true
      ) {
        options.esModule = true;
      }

      const compiler = getCompiler('simple.js', options);

      let stats;

      try {
        stats = await compile(compiler);
      } finally {
        if (type === 'success') {
          expect(stats.hasErrors()).toBe(false);
        } else if (type === 'failure') {
          const {
            compilation: { errors },
          } = stats;

          expect(errors).toHaveLength(1);
          expect(() => {
            throw new Error(errors[0].error.message);
          }).toThrowErrorMatchingSnapshot();
        }
      }
    });
  }

  for (const [key, values] of Object.entries(tests)) {
    for (const type of Object.keys(values)) {
      for (const value of values[type]) {
        createTestCase(key, value, type);
      }
    }
  }
});
