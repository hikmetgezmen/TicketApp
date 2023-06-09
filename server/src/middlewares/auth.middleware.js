import { ServiceResponse } from "../common/serviceResponse.js";
import HttpStatusCodes from "http-status-codes";
import jwtService from "../services/jwt.service.js";
export const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return next();
  const attributes = authorization.split(" ");
  if (attributes.length !== 2)
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json(
        ServiceResponse.fail(
          HttpStatusCodes.UNAUTHORIZED,
          false,
          "authMiddleware",
          ["Invalid authorization"]
        )
      );

  if (attributes[0] !== process.env.AUTH_SCHEMA)
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json(
        ServiceResponse.fail(
          HttpStatusCodes.UNAUTHORIZED,
          false,
          "authMiddleware",
          ["Invalid auth schema"]
        )
      );
  const token = attributes[1];
  jwtService.verify(token, (err, decoded) => {
    if (err)
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json(
          ServiceResponse.fail(
            HttpStatusCodes.UNAUTHORIZED,
            false,
            "authMiddleware",
            [err.message]
          )
        );

    if (Date.now() >= decoded.exp * 1000)
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json(
          ServiceResponse.fail(
            HttpStatusCodes.UNAUTHORIZED,
            false,
            "authMiddleware",
            ["Unauthorized"]
          )
        );

    req.user = decoded;
    return next();
  });
};

export const requiredAuthMiddleware = (req, res, next) => {
  if (!req.user)
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json(
        ServiceResponse.fail(
          HttpStatusCodes.UNAUTHORIZED,
          false,
          "requiredAuthMiddleware",
          ["Unauthorized"]
        )
      );
  next();
};

// export const requiredRoleMiddleware = (roles = []) => {
//   return (req, res, next) => {
//     if (!roles.some((x) => x === req.user.role))
//       return res
//         .status(HttpStatusCodes.FORBIDDEN)
//         .json(
//           ServiceResponse.fail(
//             HttpStatusCodes.FORBIDDEN,
//             false,
//             "requiredRoleMiddleware",
//             ["Forbidden"]
//           )
//         );
//     next();
//   };
// };
