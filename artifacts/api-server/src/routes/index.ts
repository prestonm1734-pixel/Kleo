import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import insightRouter from "./insight";
import marketDataRouter from "./market-data";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(insightRouter);
router.use(marketDataRouter);

export default router;
