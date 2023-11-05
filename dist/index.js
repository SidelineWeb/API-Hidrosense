"use strict";

var _express = _interopRequireDefault(require("express"));
var _dbmongo = _interopRequireDefault(require("./database/dbmongo.js"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _userRoute = _interopRequireDefault(require("./routes/user.route.js"));
var _authRoute = _interopRequireDefault(require("./routes/auth.route.js"));
var _hydrometerRoute = _interopRequireDefault(require("./routes/hydrometer.route.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_dotenv.default.config();
const app = (0, _express.default)();
const port = process.env.PORT || 3000;
(0, _dbmongo.default)();
app.use(_express.default.json());
app.use("/user", _userRoute.default);
app.use("/auth", _authRoute.default);
app.use("/hydrometer", _hydrometerRoute.default);
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));