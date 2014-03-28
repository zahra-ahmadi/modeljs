function jsCesk(cc)
{
  // address generator
  var a = cc.a;
  // primitive lattice
  var p = cc.p;
  
  var gcFlag = cc.gc === undefined ? true : cc.gc;
  
  assertDefinedNotNull(a);
//  assertDefinedNotNull(b);
  assertDefinedNotNull(p);

  // lattice (primitives + addresses)
  var l = new JipdaLattice(p); // TODO this will become param
  
  var eg = Graph.empty();
  
  // install constants
  var L_UNDEFINED = l.abst1(undefined);
  var L_NULL = l.abst1(null);
  var L_0 = l.abst1(0);
  var L_1 = l.abst1(1);
  var L_FALSE = l.abst1(false);
  var L_MININFINITY = l.abst1(-Infinity);
  var P_0 = p.abst1(0);
  var P_1 = p.abst1(1);
  var P_TRUE = p.abst1(true);
  var P_FALSE = p.abst1(false);
  var P_THIS = p.abst1("this");
  var P_PROTOTYPE = p.abst1("prototype");
  var P_CONSTRUCTOR = p.abst1("constructor");
  var P_LENGTH = p.abst1("length");
  var P_NULL = p.abst1(null);
  var P_NUMBER = p.NUMBER;
  var P_STRING = p.STRING;
  var P_DEFINED = P_NULL.join(P_TRUE).join(P_FALSE).join(P_NUMBER).join(P_STRING);
  
  var P_RETVAL = p.abst1("!retVal!");

  // install global pointers and refs
  var globala = new ContextAddr("this", 0);
  var globalRef = l.abst1(globala); // global this
  var objectPa = new ContextAddr("Object.prototype", 0);
  var objectProtoRef = l.abst1(objectPa);
  var functionPa = new ContextAddr("Function.prototype", 0);
  var functionProtoRef = l.abst1(functionPa);
  var stringPa = new ContextAddr("String.prototype", 0);
  var stringProtoRef = l.abst1(stringPa);
  var arrayPa = new ContextAddr("Array.prototype", 0);
  var arrayProtoRef = l.abst1(arrayPa);
  
  function createEnvironment(parenta)
  {
    var benv = Benv.createEnvironment(parenta);
    return benv;
  }

  function createObject(Prototype)
  {
    assertDefinedNotNull(Prototype, "[[Prototype]]");
    var benv = Benv.createObject(Prototype);
    return benv;
  }

  function createArray()
  {
    var benv = Benv.createArray(arrayProtoRef);
    return benv;
  }

  function createString(prim)
  {
    assertDefinedNotNull(prim, "prim");
    var benv = Benv.createString(prim, stringProtoRef);
    return benv;
  }

  function createClosure(node, scope)
  {
    var benv = Benv.createFunction(new BenvClosureCall(node, scope), functionProtoRef);
    return benv;
  }

  function createPrimitive(applyFunction)
  {
    var benv = Benv.createFunction(new BenvPrimitiveCall(applyFunction), functionProtoRef);
    return benv;
  }
  
  function registerProperty(object, propertyName, value)
  {
    object = object.add(p.abst1(propertyName), value);
    return object;      
  }
  
  // create global object and initial store
  var global = createObject(objectProtoRef);
  var store = Store.empty();

  function registerPrimitiveFunction(object, objectAddress, propertyName, fun)
  {
    var primFunObject = createPrimitive(fun);
    var primFunObjectAddress = new ContextAddr(objectAddress, "<" + propertyName + ">"); 
    store = store.allocAval(primFunObjectAddress, primFunObject);
    return registerProperty(object, propertyName, l.abst1(primFunObjectAddress));
  }
  
  // BEGIN OBJECT
  var objectP = createObject(L_NULL);
  objectP.toString = function () { return "<Object.prototype>"; }; // debug
  var objecta = new ContextAddr("<Object>", 0);
  objectP = registerProperty(objectP, "constructor", l.abst1(objecta));
  
  var object = createPrimitive(objectConstructor);
  object = object.add(P_PROTOTYPE, objectProtoRef);//was objectProtoRef
  global = global.add(p.abst1("Object"), l.abst1(objecta));
  
//  object = registerPrimitiveFunction(object, objecta, "getPrototypeOf", objectGetPrototypeOf);
//  object = registerPrimitiveFunction(object, objecta, "create", objectCreate);

  store = store.allocAval(objecta, object);
  store = store.allocAval(objectPa, objectP);
  // END OBJECT

      
  // BEGIN FUNCTION
  var functionP = createObject(objectProtoRef);
  functionP.toString = function () { return "<Function.prototype>"; }; // debug
  var functiona = new ContextAddr("<Function>", 0);
  var functionP = registerProperty(functionP, "constructor", l.abst1(functiona));
  var fun = createPrimitive(function () {}); // TODO
  fun = fun.add(P_PROTOTYPE, functionProtoRef);
  global = global.add(p.abst1("Function"), l.abst1(functiona));
  store = store.allocAval(functiona, fun);

  store = store.allocAval(functionPa, functionP);
  // END FUNCTION 
          
  // BEGIN STRING
  var stringP = createObject(objectProtoRef);
  stringP.toString = function () { return "<String.prototype>"; }; // debug
  var stringa = new ContextAddr("<String>", 0);
  var stringP = registerProperty(stringP, "constructor", l.abst1(stringa));
  var string = createPrimitive(stringConstructor);
  string = string.add(P_PROTOTYPE, stringProtoRef);
  var stringNa = new ContextAddr("String", 0);
  global = global.add(p.abst1("String"), l.abst1(stringa));
  store = store.allocAval(stringa, string);

  store = store.allocAval(stringPa, stringP);
  // END STRING 
          
  // BEGIN ARRAY
//  var arrayP = createObject(objectProtoRef);
//  arrayP.toString = function () { return "<Array.prototype>"; }; // debug
//  var arraya = new ContextAddr("<Array>", 0);
//  var arrayP = registerProperty(arrayP, "constructor", l.abst1(arraya));
//  var array = createPrimitive(arrayConstructor);
//  array = array.add(P_PROTOTYPE, arrayProtoRef);
//  var arrayNa = new ContextAddr("Array", 0);
//  store = store.allocAval(arraya, array);
//  global = global.add(p.abst1("Array"), l.abst1(arraya));
//  
//  arrayP = registerPrimitiveFunction(arrayP, arrayPa, "concat", arrayConcat);
//  arrayP = registerPrimitiveFunction(arrayP, arrayPa, "push", arrayPush);
//  arrayP = registerPrimitiveFunction(arrayP, arrayPa, "map", arrayMap);
//  arrayP = registerPrimitiveFunction(arrayP, arrayPa, "reduce", arrayReduce); // TODO
//  arrayP = registerPrimitiveFunction(arrayP, arrayPa, "filter", arrayFilter);
//  store = store.allocAval(arrayPa, arrayP);
  // END ARRAY
  
  // BEGIN MATH
//  var math = createObject(objectProtoRef);
//  math = registerPrimitiveFunction(math, globala, "abs", mathAbs);
//  math = registerPrimitiveFunction(math, globala, "round", mathRound);
//  math = registerPrimitiveFunction(math, globala, "sin", mathCos);
//  math = registerPrimitiveFunction(math, globala, "cos", mathSin);
//  math = registerPrimitiveFunction(math, globala, "sqrt", mathSqrt);
//  math = registerPrimitiveFunction(math, globala, "max", mathMax);
//  math = registerPrimitiveFunction(math, globala, "random", mathRandom);
//  math = registerProperty(math, "PI", l.abst1(Math.PI));
//  var matha = new ContextAddr("<Math>", 0);
//  store = store.allocAval(matha, math);
//  global = global.add(p.abst1("Math"), l.abst1(matha));
  // END MATH
  
  // BEGIN GLOBAL
  global = global.add(P_THIS, globalRef); // global "this" address
  // ECMA 15.1.1 value properties of the global object (no "null", ...)
  global = registerProperty(global, "undefined", L_UNDEFINED);
  global = registerProperty(global, "NaN", l.abst1(NaN));
  global = registerProperty(global, "Infinity", l.abst1(Infinity));

  // specific interpreter functions
//  global = registerPrimitiveFunction(global, globala, "$meta", $meta);
  global = registerPrimitiveFunction(global, globala, "$join", $join);
//  global = registerPrimitiveFunction(global, globala, "print", _print);
  // end specific interpreter functions
  
  store = store.allocAval(globala, global);
  // END GLOBAL
  
  // BEGIN PRIMITIVES
  function objectConstructor(application, operands, objectAddress, stack, benva, store, time)
  {
    var cont = stack[0];
    var stack2 = stack.slice(1);
    var obj = createObject(objectProtoRef);
    store = allocAval(objectAddress, obj, stack, store);
    return kont[0].apply(stack2.addFirst(l.abst1(objectAddress)), store, time);
  }    
  
  function stringConstructor(application, operands, ths, stack, benva, store, time)
  {
    // TODO (also for other built-in constructors): throwing away freshly created object (that has different addr, so not that bad)!
    // (postpone creating fresh object?)
    if (isNewExpression(application))
    {
      var cont = stack[0];
      var stack2 = stack.slice(1);

      if (operands.length === 0)
      {
        var stringBenv = createString(p.abst1("")); // TODO constant 
        var stringAddress = a.string(application, time);
        stringBenv = stringBenv.add(P_LENGTH, L_0);
        store = allocAval(stringAddress, stringBenv, stack, store);
        return kont[0].apply(stack2.addFirst(l.abst1(stringAddress)), store, time);
      }
      
      var prim = operands[0].user.ToString(); // TODO ToString iso. project
      var stringBenv = createString(prim); 
      var stringAddress = a.array(application, time); // TODO this is not an array(!)
      stringBenv = stringBenv.add(P_LENGTH, new JipdaValue(prim.length(), []));
      store = allocAval(stringAddress, stringBenv, stack, store);
      return kont[0].apply(stack2.addFirst(l.abst1(stringAddress)), store, time);        
    }
    if (operands.length === 0)
    {
      var cont = stack[0];
      var stack2 = stack.slice(1);
      return kont[0].apply(stack2.addFirst(l.abst1("")), store, time); // TODO constant  
    }
    return ToString(application, stack.addFirst(operands[0]), benva, store, time);
  }    
  
  function $join(operandValues, thisa, benva, store, kont, effects)
  {
    var value = operandValues.reduce(Lattice.join, BOT);
    return kont.pop(function (frame) {return new KontState(frame, value, store)});
  }    
  
      
  // END PRIMITIVES
  
  
  function BenvPrimitiveCall(applyFunction)
  {
    this.applyFunction = applyFunction;
  }

  BenvPrimitiveCall.prototype.toString =
    function ()
    {
      return "<BenvPrimitiveCall>";
    }
  
  BenvPrimitiveCall.prototype.equals =
    function (other)
    {
      if (this === other)
      {
        return true;
      }
      if (!(this instanceof BenvPrimitiveCall))
      {
        return false;
      }
      return this.applyFunction === other.applyFunction; // this case needed? (finite number of fixed prims)
    }
  
  BenvPrimitiveCall.prototype.addresses =
    function ()
    {
      return [];
    } 
  
  function BenvClosureCall(node, scope)
  {
    this.node = node;
    this.scope = scope;
  }

  BenvClosureCall.prototype.toString =
    function ()
    {
      return "(" + this.node.tag + " " + this.scope + ")";
    }
  BenvClosureCall.prototype.nice =
    function ()
    {
      return "<BenvClosureCall " + this.node.tag + ">"
    }

  BenvClosureCall.prototype.equals =
    function (other)
    {
      if (this === other)
      {
        return true;
      }
      if (!(this instanceof BenvClosureCall))
      {
        return false;
      }
      return this.node === other.node
        && this.scope.equals(other.scope);
    }
  BenvClosureCall.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.scope.hashCode();
      return result;      
    }


  BenvClosureCall.prototype.applyFunction =
    function (operandValues, thisa, benva, store, kont, effects)
    {
//      print("BenvClosureCall.applyFunction", application, "operandValues", operandValues, "ths", ths);
      var fun = this.node;
      var statica = this.scope;
      var extendedBenva = a.benv(fun, benva, store, kont); // was 'application'
      return kont.push(new ReturnMarker(benva, this, extendedBenva), new ApplyState(fun, statica, operandValues, thisa, extendedBenva, store), effects);
    }

  BenvClosureCall.prototype.addresses =
    function ()
    {
      return [this.scope];
    }
  
  function gc(q, kont)
  {
    var store = q.store;
    if (gcFlag)
    {
      var stackAddresses = kont.ss.addresses();
      var rootSet = q.addresses().concat(stackAddresses);
      var gcStore = Agc.collect(store, rootSet);
      return gcStore;
    }
    else
    {
      return store;
    }
  }  
  
  function StackSummary(addresses)
  {
    this._addresses = addresses;
  }

  StackSummary.empty =
    function ()
    {
      return new StackSummary(ArraySet.empty());
    }
  
  StackSummary.prototype.toString =
    function ()
    {
      return this._addresses.toString();
    }

  StackSummary.prototype.equals =
    function (x)
    {
      return (x instanceof StackSummary)
        && this._addresses.equals(x._addresses)
    }

  StackSummary.prototype.hashCode =
    function ()
    {
      var prime = 43;
      var result = 1;
      result = prime * result + this._addresses.hashCode();
      return result;    
    }

  StackSummary.prototype.push =
    function (frame)
    {
      var addresses = this._addresses.addAll(frame.addresses());
      return new StackSummary(addresses);
    }
  
  StackSummary.prototype.addresses =
    function ()
    {
      return this._addresses.values();
    }
  
//  function StackSummary(addresses, appContext)
//  {
//    this._addresses = addresses;
//    this._appContext = appContext;
//  }
//
//  StackSummary.empty =
//    function ()
//    {
//      return new StackSummary(ArraySet.empty(), null);
//    }
//  
//  StackSummary.prototype.toString =
//    function ()
//    {
//      return "(" + this._addresses + ";" + this._appContext + ")";
//    }
//
//  StackSummary.prototype.equals =
//    function (x)
//    {
//      return (x instanceof StackSummary)
//        && this._addresses.equals(x._addresses)
//        && this._appContext.equals(x._appContext)
//    }
//
//  StackSummary.prototype.hashCode =
//    function ()
//    {
//      var prime = 43;
//      var result = 1;
//      result = prime * result + this._addresses.hashCode();
//      result = prime * result + HashCode.hashCode(this._appContext);
//      return result;    
//    }
//
//  StackSummary.prototype.push =
//    function (frame)
//    {
//      var addresses = this._addresses.addAll(frame.addresses());
//      var appContext = frame.callable || this._appContext;
//      return new StackSummary(addresses, appContext);
//    }
//  
//  StackSummary.prototype.addresses =
//    function ()
//    {
//      return this._addresses.values();
//    }
//  
  function InitState(node, benva, store, haltFrame)
  {
    this.type = "init";
    this.node = node;
    this.benva = benva;
    this.store = store;
    this.haltFrame = haltFrame;
  }
  InitState.prototype.toString =
    function ()
    {
      return "(init " + this.node + " " + this.benva + ")";
    }
  InitState.prototype.nice =
    function ()
    {
      return "#init " + this.node.tag;
    }
  InitState.prototype.equals =
    function (x)
    {
      return this.type === x.type
        && this.node === x.node 
        && Eq.equals(this.benva, x.benva)
        && Eq.equals(this.store, x.store)
        && Eq.equals(this.haltFrame, x.haltFrame);
    }
  InitState.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      result = prime * result + this.haltFrame.hashCode();
      return result;
    }
  InitState.prototype.next =
    function (kont)
    {
      return kont.push(this.haltFrame, new EvalState(this.node, this.benva, this.store));
    }
  InitState.prototype.addresses =
    function ()
    {
      return [this.benva];
    }

  function EvalState(node, benva, store)
  {
    this.type = "eval";
    assertDefinedNotNull(node);
    this.node = node;
    this.benva = benva;
    this.store = store;
  }
  EvalState.prototype.toString =
    function ()
    {
      return "#eval " + this.node.tag;
    }
  EvalState.prototype.nice =
    function ()
    {
      return "#eval " + this.node.tag;
    }
  EvalState.prototype.equals =
    function (x)
    {
      return (x instanceof EvalState)
        && this.node === x.node 
        && Eq.equals(this.benva, x.benva)
        && Eq.equals(this.store, x.store);
    }
  EvalState.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      return result;
    }
  EvalState.prototype.next =
    function (kont)
    {
      return evalNode(this.node, this.benva, gc(this, kont), kont);
    }
  EvalState.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  
  function KontState(frame, value, store)
  {
    this.type = "kont";  
    this.frame = frame;
    this.value = value;
    this.store = store;
  }
  KontState.prototype.equals =
    function (x)
    {
      return (x instanceof KontState)
        && Eq.equals(this.frame, x.frame) 
        && Eq.equals(this.value, x.value) 
        && Eq.equals(this.store, x.store)
    }
  KontState.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.frame.hashCode();
      result = prime * result + this.value.hashCode();
      return result;
    }
  KontState.prototype.toString =
    function ()
    {
      return "#kont-" + this.frame;
    }
  KontState.prototype.nice =
    function ()
    {
      return "#kont-" + this.frame.toString();
    }
  KontState.prototype.next =
    function (kont)
    {
      return applyKont(this.frame, this.value, this.store, kont)
    }
  KontState.prototype.addresses =
    function ()
    {
      return this.frame.addresses().concat(this.value.addresses());
    }
  
  function ApplyState(fun, statica, operandValues, thisa, extendedBenva, store)
  {
    this.type = "apply";
//    this.node = node;
    this.fun = fun;
    this.statica = statica;
    this.operandValues = operandValues;
    this.thisa = thisa;
//    this.benva = benva;
    this.extendedBenva = extendedBenva;
    this.store = store;
  }
  ApplyState.prototype.equals =
    function (x)
    {
      return (x instanceof ApplyState)
//        && this.node === x.node
        && this.fun === x.fun
        && Eq.equals(this.statica, x.statica)
        && Eq.equals(this.operandValues, x.operandValues)
        && Eq.equals(this.thisa, x.thisa)
//        && Eq.equals(this.benva, x.benva)
        && Eq.equals(this.extendedBenva, x.extendedBenva)
        && Eq.equals(this.store, x.store)
    }
  ApplyState.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
//      result = prime * result + this.node.hashCode();
      result = prime * result + this.fun.hashCode();
      result = prime * result + this.statica.hashCode();
      result = prime * result + this.operandValues.hashCode();
      result = prime * result + this.thisa.hashCode();
//      result = prime * result + this.benva.hashCode();
      result = prime * result + this.extendedBenva.hashCode();
      return result;
    }
  ApplyState.prototype.toString =
    function ()
    {
      return "#apply ";// + this.node.tag;
    }
  ApplyState.prototype.nice =
    function ()
    {
      return "#apply ";// + this.node.tag;
    }
  ApplyState.prototype.next =
    function (kont)
    {
      return applyClosure(this.fun, this.statica, this.operandValues, this.thisa, this.extendedBenva, this.store, kont);
    }
  ApplyState.prototype.addresses =
    function ()
    {
      return [this.statica, /*this.benva,*/ this.thisa]
              .concat(this.operandValues.flatMap(function (operandValue) {return operandValue.addresses()}));
    }

  function ReturnState(returna, store, frame)
  {
    this.type = "return";
//    this.node = node;
    this.returna = returna;
    this.store = store;
    this.frame = frame;
  }
  
  ReturnState.prototype.equals =
    function (x)
    {
      return (x instanceof ReturnState)
//        && this.node === x.node 
        && Eq.equals(this.returna, x.returna) 
        && Eq.equals(this.store, x.store) 
        && Eq.equals(this.frame, x.frame); 
    }
  ReturnState.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
//      result = prime * result + this.node.hashCode();
      result = prime * result + this.returna.hashCode();
      result = prime * result + this.frame.hashCode();
      return result;
    }
  ReturnState.prototype.toString =
    function ()
    {
      return "#return-";// + this.node.tag;
    }
  ReturnState.prototype.nice =
    function ()
    {
      return "#return-";// + this.node.tag;
    }
  ReturnState.prototype.next =
    function (kont)
    {
      return scanReturn(this.returna, this.store, this.frame, kont);
    }
  ReturnState.prototype.addresses =
    function ()
    {
      return [this.returna]
              .concat(this.frame.addresses());
    }
  
  function ReturnMarker(benva, callable, extendedBenva)
  {
//    this.node = node;
    this.benva = benva;
    this.callable = callable;
    this.extendedBenva = extendedBenva;
  }
  ReturnMarker.prototype.isMarker = true;
  ReturnMarker.prototype.equals =
    function (x)
    {
      return (x instanceof ReturnMarker)
//        && this.node === x.node
        && Eq.equals(this.benva, x.benva)
        && Eq.equals(this.callable, x.callable)
        && Eq.equals(this.extendedBenva, x.extendedBenva)
    }
  ReturnMarker.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
//      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      result = prime * result + this.callable.hashCode();
      result = prime * result + this.extendedBenva.hashCode();
      return result;
    }
  ReturnMarker.prototype.toString =
    function ()
    {
      return "RET-";// + this.node.tag;
    }
  ReturnMarker.prototype.nice =
    function ()
    {
      return "RET-";// + this.node.tag;
    }
  ReturnMarker.prototype.addresses =
    function ()
    {
      return [];
    }
  ReturnMarker.prototype.apply =
    function (value, store, kont)
    {
      throw new Error("cannot apply marker");
    }
  
  function VariableDeclarationKont(node, i, benva)
  {
    this.node = node;
    this.i = i;
    this.benva = benva;
  }
  VariableDeclarationKont.prototype.equals =
    function (x)
    {
      return x instanceof VariableDeclarationKont
        && this.node === x.node
        && this.i === x.i
        && Eq.equals(this.benva, x.benva);
    }
  VariableDeclarationKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.i;
      result = prime * result + this.benva.hashCode();
      return result;
    }
  VariableDeclarationKont.prototype.toString =
    function ()
    {
      return "vdecl-" + this.node.tag + "-" + this.i;
    }
  VariableDeclarationKont.prototype.nice =
    function ()
    {
      return "vdecl-" + this.node.tag + "-" + this.i;
    }
  VariableDeclarationKont.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  VariableDeclarationKont.prototype.apply =
    function (value, store, kont)
    {
      var node = this.node;
      var benva = this.benva;
      var i = this.i;
      
      var nodes = node.declarations;
      if (i === nodes.length)
      {
        return kont.pop(function (frame) {return new KontState(frame, value, store)});
      }
      var frame = new VariableDeclarationKont(node, i + 1, benva);
      return kont.push(frame, new EvalState(nodes[i], benva, store));
    }
  
  function VariableDeclaratorKont(node, benva)
  {
    this.node = node;
    this.benva = benva;
  }
  VariableDeclaratorKont.prototype.equals =
    function (x)
    {
      return x instanceof VariableDeclaratorKont
        && this.node === x.node
        && Eq.equals(this.benva, x.benva);
    }
  VariableDeclaratorKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      return result;
    }
  VariableDeclaratorKont.prototype.toString =
    function ()
    {
      return "vrator " + this.node.tag;
    }
  VariableDeclaratorKont.prototype.nice =
    function ()
    {
      return "vrator " + this.node.tag;
    }
  VariableDeclaratorKont.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  VariableDeclaratorKont.prototype.apply =
    function (value, store, kont)
    {
      var effects = [];
      var id = this.node.id;
      var benva = this.benva;
      var benv = store.lookupAval(benva);
      var name = p.abst1(id.name);
      benv = benv.add(name, value);
      store = store.updateAval(benva, benv); // side-effect
      return kont.pop(function (frame) {return new KontState(frame, L_UNDEFINED, store)}, effects);
    }
  
  function LeftKont(node, benva)
  {
    this.node = node;
    this.benva = benva;
  }
  LeftKont.prototype.equals =
    function (x)
    {
      return x instanceof LeftKont
        && this.node === x.node
        && Eq.equals(this.benva, x.benva);
    }
  LeftKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      return result;
    }
  LeftKont.prototype.toString =
    function ()
    {
      return "left-" + this.node.tag;
    }
  LeftKont.prototype.nice =
    function ()
    {
      return "left-" + this.node.tag;
    }
  LeftKont.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  LeftKont.prototype.apply =
    function (leftValue, store, kont)
    {
      var node = this.node;
      var benva = this.benva;
      var frame = new RightKont(node, benva, leftValue);
      return kont.push(frame, new EvalState(node.right, benva, store));
    }
  
  function RightKont(node, benva, leftValue)
  {
    this.node = node;
    this.benva = benva;
    this.leftValue = leftValue;
  }
  RightKont.prototype.equals =
    function (x)
    {
      return x instanceof RightKont
        && this.node === x.node
        && Eq.equals(this.benva, x.benva)
        && Eq.equals(this.leftValue, x.leftValue);
    }
  RightKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      result = prime * result + this.leftValue.hashCode();
      return result;
    }
  RightKont.prototype.toString =
    function ()
    {
      return "right-" + this.node.tag;
    }
  RightKont.prototype.nice =
    function ()
    {
      return "right-" + this.node.tag;
    }
  RightKont.prototype.addresses =
    function ()
    {
      return this.leftValue.addresses().addLast(this.benva);
    }
  RightKont.prototype.apply =
    function (rightValue, store, kont)
    {
      var node = this.node;
      var benva = this.benva;
      var leftValue = this.leftValue;
      var leftPrim = leftValue.prim;
      var rightPrim = rightValue.prim;
      var leftAs = leftValue.addresses();
      var rightAs = rightValue.addresses();
      if (leftAs.length === 0 && rightAs.length === 0)
      {
        // fast path: primitives (no need for coercions on interpreter level)
        return applyPrimitiveBinaryExpression(node, leftPrim, rightPrim, benva, store, kont);
      }
      throw new Error("TODO");
    }
  
  function AssignIdentifierKont(node, benva)
  {
    this.node = node;
    this.benva = benva;
  }
  AssignIdentifierKont.prototype.equals =
    function (x)
    {
      return x instanceof AssignIdentifierKont
        && this.node === x.node 
        && Eq.equals(this.benva, x.benva);
    }
  AssignIdentifierKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      return result;
    }
  AssignIdentifierKont.prototype.toString =
    function ()
    {
      return "asid-" + this.node.tag;
    }
  AssignIdentifierKont.prototype.nice =
    function ()
    {
      return "asid-" + this.node.tag;
    }
  AssignIdentifierKont.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  AssignIdentifierKont.prototype.apply =
    function (value, store, kont)
    {
      var node = this.node;
      var benva = this.benva;
      var id = node.left;
      var effects = [];
      store = doScopeSet(p.abst1(id.name), value, benva, store, effects);
      return kont.pop(function (frame) {return new KontState(frame, value, store)}, effects);
    }
  
  function OperatorKont(node, benva)
  {
    this.node = node;
    this.benva = benva;
  }
  OperatorKont.prototype.equals =
    function (x)
    {
      return x instanceof OperatorKont
        && this.node === x.node
        && Eq.equals(this.benva, x.benva);
    }
  OperatorKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      return result;
    }
  OperatorKont.prototype.toString =
    function ()
    {
      return "rator-" + this.node.tag;
    }
  OperatorKont.prototype.nice =
    function ()
    {
      return "rator-" + this.node.tag;
    }
  OperatorKont.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  OperatorKont.prototype.apply =
    function (operatorValue, store, kont)
    {
      var node = this.node;
      var benva = this.benva;
      var operands = node.arguments;
  
      if (operands.length === 0)
      {
        return applyProc(operatorValue, [], globalRef, benva, store, kont);
      }
      var frame = new OperandsKont(node, 1, benva, operatorValue, [], globalRef);
      return kont.push(frame, new EvalState(operands[0], benva, store));
    }
  
  function OperandsKont(node, i, benva, operatorValue, operandValues, thisValue)
  {
    this.node = node;
    this.i = i;
    this.benva = benva;
    this.operatorValue = operatorValue; 
    this.operandValues = operandValues; 
    this.thisValue = thisValue;
  }
  OperandsKont.prototype.equals =
    function (x)
    {
      return x instanceof OperandsKont
        && this.node === x.node 
        && this.i === x.i 
        && Eq.equals(this.benva, x.benva) 
        && Eq.equals(this.operatorValue, x.operatorValue) 
        && Eq.equals(this.operandValues, x.operandValues) 
        && Eq.equals(this.thisValue, x.thisValue);
    }
  OperandsKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.i;
      result = prime * result + this.benva.hashCode();
      result = prime * result + this.operatorValue.hashCode();
      result = prime * result + this.operandValues.hashCode();
      result = prime * result + this.thisValue.hashCode();
      return result;
    }
  OperandsKont.prototype.toString =
    function ()
    {
      return "rand-" + this.node.tag + "-" + this.i;
    }
  OperandsKont.prototype.nice =
    function ()
    {
      return "rand-" + this.node.tag + "-" + this.i;
    }
  OperandsKont.prototype.addresses =
    function ()
    {
      return this.operatorValue.addresses()
        .concat(this.operandValues.flatMap(function (value) {return value.addresses()}))
        .concat(this.thisValue.addresses())
        .addLast(this.benva);
    }
  OperandsKont.prototype.apply =
    function (operandValue, store, kont)
    {
      var node = this.node;
      var benva = this.benva;
      var i = this.i;
      var operatorValue = this.operatorValue;
      var operandValues = this.operandValues;
      var thisValue = this.thisValue;
      var operands = node.arguments;
  
      if (i === operands.length)
      {
        return applyProc(operatorValue, operandValues.addLast(operandValue), thisValue, benva, store, kont);
      }
      var frame = new OperandsKont(node, i + 1, benva, operatorValue, operandValues.addLast(operandValue), thisValue);
      return kont.push(frame, new EvalState(operands[i], benva, store));
    }
  
  function BodyKont(node, i, benva)
  {
    this.node = node;
    this.i = i;
    this.benva = benva;
  }
  BodyKont.prototype.equals =
    function (x)
    {
      return x instanceof BodyKont
        && this.node === x.node
        && this.i === x.i
        && Eq.equals(this.benva, x.benva)
    }
  BodyKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.i;
      result = prime * result + this.benva.hashCode();
      return result;
    }
  BodyKont.prototype.toString =
    function ()
    {
      return "body-" + this.node.tag + "-" + this.i;
    }
  BodyKont.prototype.nice =
    function ()
    {
      return "body-" + this.node.tag + "-" + this.i;
    }
  BodyKont.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  BodyKont.prototype.apply =
    function (value, store, kont)
    {
      var node = this.node;
      var benva = this.benva;
      var i = this.i;
      
      var nodes = node.body;
      if (i === nodes.length - 1)
      {
        return kont.unch(new EvalState(nodes[i], benva, store));
      }
      var frame = new BodyKont(node, i + 1, benva);
      return kont.push(frame, new EvalState(nodes[i], benva, store));
    }
  
  function ReturnKont(node, benva)
  {
    this.node = node;
    this.benva = benva;
  }
  ReturnKont.prototype.equals =
    function (x)
    {
      return x instanceof ReturnKont
        && this.node === x.node 
        && Eq.equals(this.benva, x.benva);
    }
  ReturnKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      return result;
    }
  ReturnKont.prototype.toString =
    function ()
    {
      return "ret-" + this.node.tag;
    }
  ReturnKont.prototype.nice =
    function ()
    {
      return "ret-" + this.node.tag;
    }
  ReturnKont.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  ReturnKont.prototype.apply =
    function (returnValue, store, kont)
    {
      var node = this.node;
      var benva = this.benva;
      var benv = store.lookupAval(benva);
      benv = benv.add(P_RETVAL, returnValue);
      store = store.updateAval(benva, benv);
      return kont.pop(function (frame) {return new ReturnState(benva, store, frame)});
    }
  
  function IfKont(node, benva)
  {
    this.node = node;
    this.benva = benva;
  }
  IfKont.prototype.equals =
    function (x)
    {
      return x instanceof IfKont
        && this.node === x.node 
        && Eq.equals(this.benva, x.benva);
    }
  IfKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      return result;
    }
  IfKont.prototype.toString =
    function ()
    {
      return "if-" + this.node.tag;
    }
  IfKont.prototype.nice =
    function ()
    {
      return "if-" + this.node.tag;
    }
  IfKont.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  IfKont.prototype.apply =
    function (conditionValue, store, kont)
    {
      var node = this.node;
      var benva = this.benva;    
      var consequent = node.consequent;
      var alternate = node.alternate;
      // TODO ToBoolean
      var falseProj = conditionValue.meet(L_FALSE);
      if (falseProj === BOT) // no false in value
      {
        return kont.unch(new EvalState(consequent, benva, store, kont));
      }
      else if (conditionValue.equals(falseProj)) // value is false
      {
        if (alternate === null)
        {
          return kont.pop(function (frame) {return new KontState(frame, L_UNDEFINED, store)});
        }
        return kont.unch(new EvalState(alternate, benva, store, kont));
      }
      else // value > false
      {
        var consequentState = kont.unch(new EvalState(consequent, benva, store));
        var alternateState;
        if (alternate === null)
        {
          alternateState = kont.pop(function (frame) {return new KontState(frame, L_UNDEFINED, store)});
        }
        else
        {
          alternateState = kont.unch(new EvalState(alternate, benva, store));
        }
        return consequentState.concat(alternateState);
      }
    }
  
  function ObjectKont(node, i, benva, initValues)
  {
    this.node = node;
    this.i = i;
    this.benva = benva;
    this.initValues = initValues;
  }
  
  ObjectKont.prototype.equals =
    function (x)
    {
      return x instanceof ObjectKont
        && this.node === x.node
        && this.i === x.i
        && Eq.equals(this.benva, x.benva)
        && Eq.equals(this.initValues, x.initValues)
    }
  ObjectKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.i;
      result = prime * result + this.benva.hashCode();
      result = prime * result + this.initValues.hashCode();
      return result;
    }
  ObjectKont.prototype.toString =
    function ()
    {
      return "obj-" + this.node.tag + "-" + this.i;
    }
  ObjectKont.prototype.nice =
    function ()
    {
      return "obj-" + this.node.tag + "-" + this.i;
    }
  ObjectKont.prototype.addresses =
    function ()
    {
      return [this.benva].
                concat(this.initValues.flatMap(function (value) {return value.addresses()}));
    }
  ObjectKont.prototype.apply =
    function (initValue, store, kont)
    {
      var node = this.node;
      var properties = node.properties;
      var benva = this.benva;
      var i = this.i;
      var initValues = this.initValues.addLast(initValue);

      if (properties.length === i)
      {
        var effects = [];
        var obj = createObject(objectProtoRef);
        var objectAddress = a.object(node, null);
        for (var j = 0; j < i; j++)
        {
          var propertyName = p.abst1(properties[j].key.name);
          obj = obj.add(propertyName, initValues[j]);
        }
        store = store.allocAval(objectAddress, obj);
        return kont.pop(function (frame) {return new KontState(frame, l.abst1(objectAddress), store)}, effects);        
      }
      var frame = new ObjectKont(node, i + 1, benva, initValues);
      return kont.push(frame, new EvalState(properties[i].value, benva, store));
    }
  
  function MemberKont(node, benva)
  {
    this.node = node;
    this.benva = benva;
  }
  
  MemberKont.prototype.equals =
    function (x)
    {
      return x instanceof MemberKont
        && this.node === x.node
        && Eq.equals(this.benva, x.benva)
    }
  MemberKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      return result;
    }
  MemberKont.prototype.toString =
    function ()
    {
      return "mem-" + this.node.tag;
    }
  MemberKont.prototype.nice =
    function ()
    {
      return "mem-" + this.node.tag;
    }
  MemberKont.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  MemberKont.prototype.apply =
    function (objectRef, store, kont)
    {
      var node = this.node;
      var property = node.property;
      if (node.computed)
      {
        throw new Error("TODO");
      }
      var effects = [];
      var value = doProtoLookup(p.abst1(property.name), objectRef, store, effects);
      return kont.pop(function (frame) {return new KontState(frame, value, store)}, effects);
    }
  
  function CallMemberKont(node, benva)
  {
    this.node = node;
    this.benva = benva;
  }
  
  CallMemberKont.prototype.equals =
    function (x)
    {
      return x instanceof CallMemberKont
        && this.node === x.node
        && Eq.equals(this.benva, x.benva)
    }
  CallMemberKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      return result;
    }
  CallMemberKont.prototype.toString =
    function ()
    {
      return "memcall-" + this.node.tag;
    }
  CallMemberKont.prototype.nice =
    function ()
    {
      return "memcall-" + this.node.tag;
    }
  CallMemberKont.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  CallMemberKont.prototype.apply =
    function (objectRef, store, kont)
    {
      var node = this.node;
      var benva = this.benva;
      
      var property = node.callee.property;
      if (node.computed)
      {
        throw new Error("TODO");
      }
      var effects = [];
      var operatorValue = doProtoLookup(p.abst1(property.name), objectRef, store, effects);
      var operands = node.arguments;
      
      if (operands.length === 0)
      {
        return applyProc(operatorValue, [], objectRef, benva, store, kont);
      }
      var frame = new OperandsKont(node, 1, benva, operatorValue, [], globalRef);
      return kont.push(frame, new EvalState(operands[0], benva, store));
    }
  
  function MemberAssignmentKont(node, benva)
  {
    this.node = node;
    this.benva = benva;
  }
  
  MemberAssignmentKont.prototype.equals =
    function (x)
    {
      return x instanceof MemberAssignmentKont
        && this.node === x.node
        && Eq.equals(this.benva, x.benva)
    }
  MemberAssignmentKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      return result;
    }
  MemberAssignmentKont.prototype.toString =
    function ()
    {
      return "memas-" + this.node.tag;
    }
  MemberAssignmentKont.prototype.nice =
    function ()
    {
      return "memas-" + this.node.tag;
    }
  MemberAssignmentKont.prototype.addresses =
    function ()
    {
      return [this.benva];
    }
  MemberAssignmentKont.prototype.apply =
    function (objectRef, store, kont)
    {
      var node = this.node;
      var benva = this.benva;
      var right = node.right;
      var frame = new MemberAssignmentValueKont(node, benva, objectRef);
      return kont.push(frame, new EvalState(right, benva, store));
    }
  
  function MemberAssignmentValueKont(node, benva, objectRef)
  {
    this.node = node;
    this.benva = benva;
    this.objectRef = objectRef;
  }
  
  MemberAssignmentValueKont.prototype.equals =
    function (x)
    {
      return x instanceof MemberAssignmentValueKont
        && this.node === x.node
        && Eq.equals(this.benva, x.benva)
        && Eq.equals(this.objectRef, x.objectRef)
    }
  MemberAssignmentValueKont.prototype.hashCode =
    function ()
    {
      var prime = 7;
      var result = 1;
      result = prime * result + this.node.hashCode();
      result = prime * result + this.benva.hashCode();
      result = prime * result + this.objectRef.hashCode();
      return result;
    }
  MemberAssignmentValueKont.prototype.toString =
    function ()
    {
      return "memasv-" + this.node.tag;
    }
  MemberAssignmentValueKont.prototype.nice =
    function ()
    {
      return "memasv-" + this.node.tag;
    }
  MemberAssignmentValueKont.prototype.addresses =
    function ()
    {
      return [this.benva].concat(this.objectRef.addresses());
    }
  MemberAssignmentValueKont.prototype.apply =
    function (value, store, kont)
    {
      var node = this.node;
      var left = node.left;
      var property = left.property;
      if (left.computed)
      {
        throw new Error("TODO");
      }
      var effects = [];
      store = doProtoSet(p.abst1(property.name), value, this.objectRef, store, effects);
      return kont.pop(function (frame) {return new KontState(frame, value, store)}, effects);
    }
  
  function doScopeLookup(name, benva, store, effects)
  {
    var result = BOT;
    var benvas = [benva];
    while (benvas.length !== 0)
    {
      var a = benvas[0];
      benvas = benvas.slice(1);
      var benv = store.lookupAval(a);
      var value = benv.lookup(name);
      if (value !== BOT)
      {
        result = result.join(value);
      }
      else
      {
        benvas = benvas.concat(benv.parents);
      }
    }
    // approximation: if some chains have the var, then we assume ok
    // in theory we should check each chain separately, join the found results, and if necessary
    // create an error branch if one of the chains doesn't find the var
    if (result === BOT)
    {
      throw new Error("ReferenceError: " + name + " is not defined"); //TODO turn this into stack trace      
    }
    return result;
  }

  function doProtoLookup(name, objectRef, store, effects)
  {
    var result = BOT;
    var benvas = objectRef.addresses();
    while (benvas.length !== 0)
    {
      var a = benvas[0];
      benvas = benvas.slice(1);
      var benv = store.lookupAval(a);
      var value = benv.lookup(name);
      if (value === BOT)
      {
        if (benv.Prototype.subsumes(L_NULL))
        {
           result = result.join(L_UNDEFINED);
        }
        var cprotoAddresses = benv.Prototype.addresses();
        if (!cprotoAddresses)
        {
          throw new Error("doProtoLookup: no addresses for " + benv.Prototype);
          //return fcont(null); // TODO null checks are still in place everywhere this function is called
        }
        benvas = benvas.concat(benv.Prototype.addresses());
      }
      else
      {
        result = result.join(value);
      }
    }
    if (result === BOT)
    {
      throw new Error("lookup of " + name + " returns BOT");      
    }
    return result;
  }

  function doScopeSet(name, value, benva, store, effects)
  {
    var benvas = [benva];
    var setTopLevel = false;
    while (benvas.length !== 0)
    {
      var a = benvas[0];
      benvas = benvas.slice(1);
      var benv = store.lookupAval(a);
      var existing = benv.lookup(name);
      if (existing !== BOT)
      {
        benv = benv.add(name, value);
        store = store.updateAval(a, benv); // side-effect
      }
      else
      {
        var parents = benv.parents;
        if (parents.length === 0)
        {
          setTopLevel = true;
        }
        else
        {
          benvas = benvas.concat(benv.parents);
        }
      }
    }
    if (setTopLevel)
    {
      var benv = store.lookupAval(globala);
      var existing = benv.lookup(name);
      benv = benv.add(name, value);
      store = store.updateAval(globala, benv); // side-effect
    }
    return store;
  }
  
  function doProtoSet(name, value, objectRef, store, effects)
  {
    var benvas = objectRef.addresses();
    while (benvas.length !== 0)
    {
      var a = benvas[0];
      benvas = benvas.slice(1);
      var benv = store.lookupAval(a);
      var existing = benv.lookup(name);
      benv = benv.add(name, value);
      store = store.updateAval(a, benv); // side-effect
    }
    return store;
  }
  
  function evalEmptyStatement(node, benva, store, kont)
  {
    return kont.pop(function (frame) {return new KontState(frame, L_UNDEFINED, store)});
  }

  function evalLiteral(node, benva, store, kont)
  {
    var value = l.abst1(node.value);
    return kont.pop(function (frame) {return new KontState(frame, value, store)});
  }

  function evalIdentifier(node, benva, store, kont)
  {
    var effects = [];
    var value = doScopeLookup(p.abst1(node.name), benva, store, effects);
    return kont.pop(function (frame) {return new KontState(frame, value, store)}, effects);
  }

  function evalProgram(node, benva, store, kont)
  {
    return evalStatementList(node, benva, store, kont);
  }

  function evalStatementList(node, benva, store, kont)
  {
    var nodes = node.body;
    if (nodes.length === 0)
    {
      return kont.pop(function (frame) {return new KontState(frame, L_UNDEFINED, store)});
    }
    if (nodes.length === 1)
    {
      return kont.unch(new EvalState(nodes[0], benva, store));
    }
    var frame = new BodyKont(node, 1, benva);
    return kont.push(frame, new EvalState(nodes[0], benva, store));
  }

  function evalVariableDeclaration(node, benva, store, kont)
  {
    var nodes = node.declarations;
    if (nodes.length === 0)
    {
      throw new Error("no declarations in " + node);
    }
    if (nodes.length === 1)
    {
      return evalVariableDeclarator(nodes[0], benva, store, kont);
    }
    var frame = new VariableDeclarationKont(node, 1, benva);
    return kont.push(frame, new EvalState(nodes[0], benva, store));
  }

  function evalVariableDeclarator(node, benva, store, kont)
  {
    var init = node.init;
    if (init === null)
    {
      var effects = [];
      var vr = node.id;
      var name = p.abst1(vr.name);
      var benv = store.lookupAval(benva);
      benv = benv.add(name, L_UNDEFINED);
      store = store.updateAval(benva, benv); // side-effect
      return kont.pop(function (frame) {return new KontState(frame, L_UNDEFINED, store)}, effects);      
    }
    var frame = new VariableDeclaratorKont(node, benva);
    return kont.push(frame, new EvalState(init, benva, store));
  }

  function evalBinaryExpression(node, benva, store, kont)
  {
    var frame = new LeftKont(node, benva);
    return kont.push(frame, new EvalState(node.left, benva, store));
  }

  function applyPrimitiveBinaryExpression(node, leftPrim, rightPrim, benva, store, kont)
  {
    var operator = node.operator;
    var prim;
    switch (node.operator)
    {
      case "+":
      {
        prim = p.add(leftPrim, rightPrim);
        break;
      }
      case "*":
      {
        prim = p.mul(leftPrim, rightPrim);
        break;
      }
      case "-":
      {
        prim = p.sub(leftPrim, rightPrim);
        break;
      }
      case "/":
      {
        prim = p.div(leftPrim, rightPrim);
        break;
      }
      case "%":
      {
        prim = p.rem(leftPrim, rightPrim);
        break;
      }
      case "===":
      {
        prim = p.eqq(leftPrim, rightPrim);
        break;
      }
      case "!==":
      {
        prim = p.neqq(leftPrim, rightPrim);
        break;
      }
      case "==":
      {
        prim = p.eq(leftPrim, rightPrim);
        break;
      }
      case "!=":
      {
        prim = p.neq(leftPrim, rightPrim);
        break;
      }
      case "<":
      {
        prim = p.lt(leftPrim, rightPrim);
        break;
      }
      case "<=":
      {
        prim = p.lte(leftPrim, rightPrim);
        break;
      }
      case ">":
      {
        prim = p.gt(leftPrim, rightPrim);
        break;
      }
      case ">=":
      {
        prim = p.gte(leftPrim, rightPrim);
        break;
      }
      case "&":
      {
        prim = p.binand(leftPrim, rightPrim);
        break;
      }
      case "|":
      {
        prim = p.binor(leftPrim, rightPrim);
        break;
      }
      case "<<":
      {
        prim = p.shl(leftPrim, rightPrim);
        break;
      }
      default: throw new Error("cannot handle binary operator " + node.operator);
    }
    return kont.pop(function (frame) {return new KontState(frame, l.product(prim, []), store)});
  }

  function evalAssignmentExpression(node, benva, store, kont)
  { 
    var left = node.left;
    switch (left.type)
    {
      case "Identifier":
      {
        var right = node.right;
        var frame = new AssignIdentifierKont(node, benva);
        return kont.push(frame, new EvalState(right, benva, store));
      }
      case "MemberExpression":
      {
        var object = left.object;
        var frame = new MemberAssignmentKont(node, benva);
        return kont.push(frame, new EvalState(object, benva, store));    
      }
      default:
      {
        throw new Error("evalAssignment: cannot handle left hand side " + left);
      }
    }
  }

  function allocateClosure(node, benva, store, kont, effects)
  {
    var closure = createClosure(node, benva);
    var closurea = a.closure(node, benva, store, kont);
  
    var prototype = createObject(objectProtoRef);
    var prototypea = a.closureProtoObject(node, benva, store, kont);
    var closureRef = l.abst1(closurea);
    prototype = prototype.add(P_CONSTRUCTOR, closureRef);
    store = store.allocAval(prototypea, prototype);
  
    closure = closure.add(P_PROTOTYPE, l.abst1(prototypea));
    store = store.allocAval(closurea, closure);
    return {store: store, ref: closureRef}
  }

  function evalFunctionExpression(node, benva, store, kont)
  {
    var effects = [];
    var allocateResult = allocateClosure(node, benva, store, kont, effects);
    var closureRef = allocateResult.ref;
    store = allocateResult.store;
    return kont.pop(function (frame) {return new KontState(frame, closureRef, store)}, effects);
  }

  function evalFunctionDeclaration(node, benva, store, kont)
  {
    var effects = [];
    var allocateResult = allocateClosure(node, benva, store, kont, effects);
    var closureRef = allocateResult.ref;
    store = allocateResult.store;
    var vr = node.id;
    var name = p.abst1(vr.name);
    var benv = store.lookupAval(benva);
    benv = benv.add(name, closureRef);
    store = store.updateAval(benva, benv); // side-effect
    return kont.pop(function (frame) {return new KontState(frame, L_UNDEFINED, store)}, effects);
  }

  function evalCallExpression(node, benva, store, kont)
  {
    var calleeNode = node.callee;
      
    if (Ast.isMemberExpression(calleeNode))
    { 
      var object = calleeNode.object;
      var frame = new CallMemberKont(node, benva);
      return kont.push(frame, new EvalState(object, benva, store));
    }
    
    var frame = new OperatorKont(node, benva);
    return kont.push(frame, new EvalState(calleeNode, benva, store));      
  }

  function applyProc(operatorValue, operandValues, thisValue, benva, store, kont)
  {
    var thisAs = thisValue.addresses();
    var operatorAs = operatorValue.addresses();
    return thisAs.flatMap(
      function (thisa)
      {
        return operatorAs.flatMap(
          function (operatora)
          {
            var effects = [];
            var benv = store.lookupAval(operatora);
            var callables = benv.Call;
            return callables.flatMap(
              function (callable)
              {
                return callable.applyFunction(operandValues, thisa, benva, store, kont, effects);
              })
          })
      });
  }


  function applyClosure(funNode, statica, operandValues, thisa, extendedBenva, store, kont)
  {
    var bodyNode = funNode.body;
    var nodes = bodyNode.body;
    if (nodes.length === 0)
    {
      return kont.pop(function (frame) {return new KontState(frame, L_UNDEFINED, store)});
    }
    
    var formalParameters = funNode.params;
  
    var effects = [];
    var extendedBenv = createEnvironment(statica);
    extendedBenv = extendedBenv.add(P_THIS, l.abst1(thisa));
    
    for (var i = 0; i < formalParameters.length; i++)
    {
      var param = formalParameters[i];
      var paramName = p.abst1(param.name);
      extendedBenv = extendedBenv.add(paramName, operandValues[i]);
    }    
    
    store = store.allocAval(extendedBenva, extendedBenv);
    
    if (nodes.length === 1)
    {
      return kont.unch(new EvalState(nodes[0], extendedBenva, store), effects);
    }
    
    var frame = new BodyKont(bodyNode, 1, extendedBenva);
    return kont.push(frame, new EvalState(nodes[0], extendedBenva, store), effects);
  }

  function evalReturnStatement(node, benva, store, kont)
  {
    var argumentNode = node.argument;
    if (argumentNode === null)
    {
      var benv = store.lookupAval(benva);
      benv = benv.add(P_RETVAL, returnValue);
      store = store.updateAval(benva, benv);
      return kont.pop(function (frame) {return new ReturnState(benva, store, frame)});
    }
    
    var frame = new ReturnKont(node, benva);
    return kont.push(frame, new EvalState(argumentNode, benva, store));
  }

  function scanReturn(returna, store, frame, kont)
  {
    if (frame instanceof ReturnMarker)
    {
      var benv = store.lookupAval(returna);
      var returnValue = benv.lookup(P_RETVAL);
      return kont.pop(function (frame) {return new KontState(frame, returnValue, store)});
    }
    return kont.pop(function (frame) {return new ReturnState(returna, store, frame)});
  }
  
  function applyKont(frame, value, store, kont)
  {
    if (frame.isMarker)
    {
      return kont.pop(function (frame) {return new KontState(frame, value, store)});
    }
    return frame.apply(value, store, kont);
  }

  function evalIfStatement(node, benva, store, kont)
  {
    var testNode = node.test;
    var frame = new IfKont(node, benva);
    return kont.push(frame, new EvalState(testNode, benva, store));
  }

  function evalConditionalExpression(node, benva, store, kont)
  {
    var testNode = node.test;
    var frame = new IfKont(node, benva);
    return kont.push(frame, new EvalState(testNode, benva, store));
  }
  
  function evalObjectExpression(node, benva, store, kont)
  {
    var properties = node.properties;    
    if (properties.length === 0)
    { 
      var obj = createObject(objectProtoRef);
      var objectAddress = a.object(node, null);
      var effects = [];
      store = store.allocAval(objectAddress, obj);
      var objectRef = l.abst1(objectAddress);
      return kont.pop(function (frame) {return new KontState(frame, objectRef, store)}, effects);
    }
    var frame = new ObjectKont(node, 1, benva, []);
    return kont.push(frame, new EvalState(properties[0].value, benva, store));    
  }
  
  function evalMemberExpression(node, benva, store, kont)
  {
    var object = node.object;
    var frame = new MemberKont(node, benva);
    return kont.push(frame, new EvalState(object, benva, store));
  }

  function evalNode(node, benva, store, kont)
  {
    switch (node.type)
    {
      case "Literal": 
        return evalLiteral(node, benva, store, kont);
      case "Identifier":
        return evalIdentifier(node, benva, store, kont);
      case "BinaryExpression":
        return evalBinaryExpression(node, benva, store, kont);
      case "LogicalExpression":
        return evalLogicalExpression(node, benva, store, kont);
      case "CallExpression":
        return evalCallExpression(node, benva, store, kont);
      case "FunctionExpression":
        return evalFunctionExpression(node, benva, store, kont);
      case "AssignmentExpression":
        return evalAssignmentExpression(node, benva, store, kont);
      case "ArrayExpression":
        return evalArrayExpression(node, benva, store, kont);
      case "MemberExpression":
        return evalMemberExpression(node, benva, store, kont);
      case "ObjectExpression":
        return evalObjectExpression(node, benva, store, kont);
      case "ThisExpression":
        return evalThisExpression(node, benva, store, kont);
      case "NewExpression":
        return evalNewExpression(node, benva, store, kont);
      case "UpdateExpression":
        return evalUpdateExpression(node, benva, store, kont);
      case "UnaryExpression":
        return evalUnaryExpression(node, benva, store, kont);
      case "ExpressionStatement":
        return evalNode(node.expression, benva, store, kont);
      case "ReturnStatement": 
        return evalReturnStatement(node, benva, store, kont);
      case "BreakStatement": 
        return evalBreakStatement(node, benva, store, kont);
      case "LabeledStatement": 
        return evalLabeledStatement(node, benva, store, kont);
      case "IfStatement": 
        return evalIfStatement(node, benva, store, kont);
      case "ConditionalExpression": 
        return evalConditionalExpression(node, benva, store, kont);
      case "SwitchStatement": 
        return evalSwitchStatement(node, benva, store, kont);
      case "ForStatement": 
        return evalForStatement(node, benva, store, kont);
      case "WhileStatement": 
        return evalWhileStatement(node, benva, store, kont);
      case "FunctionDeclaration": 
        return evalFunctionDeclaration(node, benva, store, kont);
      case "VariableDeclaration": 
        return evalVariableDeclaration(node, benva, store, kont);
      case "VariableDeclarator": 
        return evalVariableDeclarator(node, benva, store, kont);
      case "BlockStatement":
        return evalStatementList(node, benva, store, kont);
      case "EmptyStatement":
        return evalEmptyStatement(node, benva, store, kont);
      case "TryStatement": 
        return evalTryStatement(node, benva, store, kont);
      case "ThrowStatement": 
        return evalThrowStatement(node, benva, store, kont);
      case "Program":
        return evalProgram(node, benva, store, kont);
      default:
        throw new "cannot handle node " + node.type; 
    }
  }

  var module = {};
  module.p = p;
  module.l = l;
  module.store = store;
  module.globala = globala;
  module.eg = eg;
  
  module.inject = 
    function (node, override)
    {
      override = override || {};
      var haltFrame = new HaltKont([globala]);
      return {q:new InitState(node, override.benva || globala, override.store || store, haltFrame), ss:StackSummary.empty()};    
    }
  
  return module; 
}

function JipdaLattice(primLattice)
{
  assertDefinedNotNull(primLattice);
  this.primLattice = primLattice;
}
JipdaLattice.prototype = new Lattice();

JipdaLattice.prototype.toString =
  function ()
  {
    return "<JipdaLattice " + this.primLattice + ">";
  }

JipdaLattice.prototype.abst =
  function (cvalues)
  {
    return cvalues.map(JipdaLattice.prototype.abst1, this).reduce(Lattice.join);
  }

JipdaLattice.prototype.abst1 =
  function (cvalue)
  {
    if (cvalue instanceof Addr)
    {
      return new JipdaValue(BOT, [cvalue]);
    }
    return new JipdaValue(this.primLattice.abst1(cvalue), []);
  }

JipdaLattice.prototype.product =
  function (prim, as)
  {
    return new JipdaValue(prim, as);
  }

function JipdaValue(prim, as)
{
  this.prim = prim;
  this.as = as;
}
JipdaValue.prototype = new LatticeValue();
JipdaValue.prototype.equals =
  function (x)
  {
    if (x === BOT)
    {
      // !! JipdaValue(BOT, []) is NOT valid value, should be encoded as BOT
      return false;
    }
    return this.prim.equals(x.prim)
      && this.as.setEquals(x.as);
  }
JipdaValue.prototype.hashCode =
  function ()
  {
    var prime = 7;
    var result = 1;
    result = prime * result + this.prim.hashCode();
    result = prime * result + this.as.hashCode();
    return result;
  }

JipdaValue.prototype.accept =
  function (visitor)
  {
    return visitor.visitJipdaValue(this);
  }

JipdaValue.prototype.addresses =
  function ()
  {
    return this.as.slice(0);
  }

JipdaValue.prototype.toString =
  function ()
  {
    return "[" + this.prim + ", " + this.as + "]";
  }

JipdaValue.prototype.join =
  function (x)
  {
    if (x === BOT)
    {
      return this;
    }
    return new JipdaValue(this.prim.join(x.prim), this.as.concat(x.as).toSet());
  }

JipdaValue.prototype.meet =
  function (x)
  {
    if (x === BOT)
    {
      return BOT;
    }
    var prim = this.prim.meet(x.prim);
    var as = this.as.removeAll(x.as);
    if (prim === BOT && as.length === 0)
    {
      return BOT;
    }
    return new JipdaValue(prim, as);
  }

JipdaValue.prototype.compareTo =
  function (x)
  {
    if (x === BOT)
    {
      return 1;
    }
    
    if (x === this)
    {
      return 0;
    }

    var c1 = this.prim.compareTo(x.prim);
    if (c1 === undefined)
    {
      return undefined;
    }
    var c2 = Lattice.subsumeComparison(this.as, x.as);
    return Lattice.joinCompareResults(c1, c2);
  }

