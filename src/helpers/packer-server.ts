import type { RsbuildInstance } from "@rsbuild/core";
import { createProxyMiddleware } from "http-proxy-middleware";
import { logger } from "../logger.ts";

const proxyHandlerMap = new Map<string, any>();

function findBestProxyMatch(path: string) {
  if (proxyHandlerMap.has(path)) {
    return proxyHandlerMap.get(path) || null;
  }
  const prefixes = Array.from(proxyHandlerMap.keys()).sort((a, b) => b.length - a.length);
  console.log("prefixes = ", prefixes, path);
  for (const prefix of prefixes) {
    if (path.startsWith(prefix)) {
      proxyHandlerMap.set(path, prefix);
      return prefix;
    }
  }
  proxyHandlerMap.set(path, null);
  return null;
}

function testReqMiddle(req: any, res: any, next: () => void) {
  console.log("---testReqMiddle------------", req.url);
  try {
    const matchedPrefix = findBestProxyMatch(req.url);
    console.log("matchedPrefix = ", matchedPrefix);
    if (matchedPrefix) {
      const handler = proxyHandlerMap.get(matchedPrefix);
      console.log("handler", handler);
      return handler(req, res, next);
    }
  }
  catch (e) {
    logger.error("代理处理异常: ---testReqMiddle error------------", e);
  }
  next();
}

/**
 * 创建开发服务器
 * build: [AsyncFunction: build],
 *   preview: [AsyncFunction: preview],
 *   startDevServer: [Function: startDevServer],
 *   createCompiler: [Function: createCompiler],
 *   createDevServer: [Function: createDevServer],
 *   addPlugins: [Function: addPlugins],
 *   getPlugins: [Function: getPlugins],
 *   removePlugins: [Function: removePlugins],
 *   isPluginExists: [Function: isPluginExists]
 * @param {} rsbuild
 * @returns {Promise<void>}
 */
export async function createPackerDevServer(rsbuild: RsbuildInstance) {
  const server = await rsbuild.createDevServer();

  // server.middlewares.use(testReqMiddle);
  server.middlewares.use("/*", (req, res, next) => {
    console.log(req.url);
    next();
  });
  logger.greet("testReqMiddle");

  const sites = [
    {
      proxyPrefix: "/",
      targetUrl: "http://dev-mc.yearrow.com",
      skipPath: ["inner"],
    },
    {
      proxyPrefix: "/inner",
      // targetUrl: "http://dev.yearrow.com",
      targetUrl: "http://192.168.178.1:3013/inner",
      pathRewrite: {
        "^/inner": "/inner",
      },
      // targetUrl: "http://192.168.1:8080",
      skipPath: [],
      // skipPath: ["inner", "approveServer"],
    },
  ];
  sites.forEach((item) => {
    const { proxyPrefix, targetUrl, skipPath, pathRewrite } = item;
    console.log("skipPath = ", skipPath, " ", "proxyPrefix = ", proxyPrefix, " || ");
    console.log();

    const filter = skipPath?.length > 0
      ? (pathname: string) => {
          return !skipPath.some((path) => {
            const regex = new RegExp(`^/${path}(?:/|$)`);
            return regex.test(pathname);
          });
        }
      : undefined;

    const options = {
      target: targetUrl,
      changeOrigin: true,
      pathRewrite,
      logger: console,
      onProxyReq: (proxyReq: any) => {
        proxyReq.setHeader("X-Proxied-By", "nest-proxy");
      },
    };

    const handler = filter
      ? createProxyMiddleware({
          ...options,
          pathFilter: filter,
        })
      : createProxyMiddleware(options);

    proxyHandlerMap.set(proxyPrefix, handler);
    // server.middlewares.use(proxyPrefix, handler);

    /* if (skipPath && skipPath.length > 0) {
      const pathFilter = function (pathname: string) {
        console.log(`pathname = ${pathname}`);
        let flag = 0;
        return !skipPath.some((path) => {
          console.log("path = ", path);
          const regex = new RegExp(`^/${path}(?:/|$)`);
          return regex.test(pathname);
        });

        // eslint-disable-next-line array-callback-return
        skipPath.map((i) => {
          if (pathname.match(`/${i}/`))
            flag++;
        });
        console.log("--------!(flag > 0)----------", !(flag > 0));
        return !(flag > 0);
      };
      console.log("222222222222222222222");
      server.middlewares.use(proxyPrefix, createProxyMiddleware({
        logger: console,
        pathFilter,
        /!* pathRewrite: {
          "^/inner": "/inner",
        }, *!/
        target: targetUrl,
        changeOrigin: true,
      }));
    }
    else {
      console.log("33333333333333333333");
      server.middlewares.use(proxyPrefix, createProxyMiddleware({ logger: console, target: targetUrl, changeOrigin: true }));
    } */

    logger.info(`已代理地址：http://localhost:${server.port}${proxyPrefix}:--->${targetUrl}`);
  });

  server.listen();
}
