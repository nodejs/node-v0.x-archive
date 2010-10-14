define(["../a", "./wrapped"], function (a, wrapped) {
  return {
    theAnswer: a.number,
	five: wrapped.five
  };
});
