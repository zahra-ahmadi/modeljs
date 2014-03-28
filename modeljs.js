function createGraph(src)
{
  var ast = Ast.createAst(src);
  var cesk = jsCesk({a:tagAg, p:new Lattice1()}); 
  var dsg = new Pushdown().analyze(ast, cesk);
  return dsg;
}