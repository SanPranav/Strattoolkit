import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { ScoutingQuestionConfig } from "@/lib/types/scoutingTypes";

export function createResolver(config: ScoutingQuestionConfig[]) {
  let obj: any = {};

  config.forEach((cfg) => {
    switch (cfg.type) {
      case "boolean":
        let bTemp: any = z.boolean();
        if (cfg.optional) {
          bTemp = bTemp.optional();
        }
        bTemp = bTemp.default(cfg.default ?? false);
        obj[cfg.name] = bTemp;
        break;

      case "text":
        let sTemp: any = z.string();
        if (cfg.optional) {
          sTemp = sTemp.optional();
        }
        if (cfg.default !== undefined) {
          sTemp = sTemp.default(cfg.default);
        }
        obj[cfg.name] = sTemp;
        break;

      case "number":
        let nTemp: any = z.number();
        nTemp = nTemp.min(cfg.min);
        nTemp = nTemp.max(cfg.max);

        if (cfg.optional) {
          nTemp = nTemp.optional();
        }
        if (cfg.default !== undefined) {
          nTemp = nTemp.default(cfg.default);
        }
        obj[cfg.name] = nTemp;
        break;

      case "slider":
        let slTemp: any = z.number();
        slTemp = slTemp.min(cfg.min);
        slTemp = slTemp.max(cfg.max);

        if (cfg.optional) {
          slTemp = slTemp.optional();
        }
        if (cfg.default !== undefined) {
          slTemp = slTemp.default(cfg.default);
        }
        obj[cfg.name] = slTemp;
        break;

      case "select":
        let selectTemp: any = z.string();
        if (cfg.optional) {
          selectTemp = selectTemp.optional();
        }
        if (cfg.default !== undefined) {
          selectTemp = selectTemp.default(cfg.default);
        }
        obj[cfg.name] = selectTemp;
        break;

      case "textarea":
        let taTemp: any = z.string();
        if (cfg.optional) {
          taTemp = taTemp.optional();
        }
        if (cfg.default !== undefined) {
          taTemp = taTemp.default(cfg.default);
        }
        obj[cfg.name] = taTemp;
        break;

      default:
        obj[(cfg as any).name] = z.any();
        break;
    }
  });

  const schema = z.object(obj);
  return zodResolver(schema);
}
