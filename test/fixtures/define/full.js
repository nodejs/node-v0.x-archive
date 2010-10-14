require.def(module.id, ["./anon", "../a", "./wrapped", "require"], function (anon, a, wrapped) {
  return {
    twiceTheAnswer: a.number + require("../a").number
  };
});
