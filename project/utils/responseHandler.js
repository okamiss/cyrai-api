const successResponse = (res, data, message = 'Success', code = 200) => {
  res.status(code).json({
      status: 'success',
      code,
      message,
      data
  });
};

const errorResponse = (res, message = 'Error', code = 500) => {
  res.status(code).json({
      status: 'error',
      code,
      message
  });
};

module.exports = {
  successResponse,
  errorResponse
};
