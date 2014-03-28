function StoreValue(aval, fresh)
{
  this.aval = aval;
  this.fresh = (fresh === undefined) ? 1 : fresh;
}

StoreValue.aval =
  function (storeValue)
  {
    return storeValue.aval;
  }

StoreValue.prototype.equals =
  function (x)
  {
    if (this === x)
    {
      return true;
    }
    return this.aval.equals(x.aval);
  }

StoreValue.prototype.hashCode =
  function ()
  {
    var prime = 5;
    var result = 1;
    result = prime * result + this.aval.hashCode();
    return result;    
  }

StoreValue.prototype.subsumes =
  function (x)
  {
    return this.aval.subsumes(x.aval);
  }

StoreValue.prototype.compareTo =
  function (x)
  {
    return this.aval.compareTo(x.aval);
  }

StoreValue.prototype.toString =
  function ()
  {
    return this.aval.toString();
  }

StoreValue.prototype.update =
  function (aval)
  {
    if (this.fresh === 1)
    {
      return this.strongUpdate(aval);
    }
    return this.weakUpdate(aval);
  }
  
StoreValue.prototype.strongUpdate =
  function (aval)
  {
    return new StoreValue(aval, 1);
  }

StoreValue.prototype.weakUpdate =
  function (aval)
  {
    return new StoreValue(this.aval.join(aval), 2);
  }

StoreValue.prototype.join =
  function (x)
  {
    if (x === BOT)
    {
      return this;
    }
    return new StoreValue(this.aval.join(x.aval), Math.max(this.fresh, x.fresh));
  }
  
StoreValue.prototype.reset =
  function ()
  {
    return new StoreValue(BOT, 0);      
  }

StoreValue.prototype.addresses =
  function ()
  {
    return this.aval.addresses();
  }
  

///////////////


function Store(map)
{
  this.map = map;
}

Store.empty =
  function ()
  {
    return new Store(TrieMap.empty());
  }

Store.prototype.equals =
  function (x)
  {
    if (!(x instanceof Store))
    {
      return false;
    }
    return this.map.equals(x.map);
  }

Store.prototype.hashCode =
  function ()
  {
    return this.map.hashCode();
  }

Store.prototype.compareTo =
  function (x)
  {
    return Lattice.subsumeComparison(this, x);
  }
  
Store.prototype.subsumes =
  function (x)
  {
    if (!(x instanceof Store))
    {
      return false;
    }
    return this.map.subsumes(x.map);
  }

Store.prototype.diff = // debug
  function (x)
  {
    var diff = [];
    var entries = this.map.entries();
    for (var i = 0; i < entries.length; i++)
    {
      var entry = entries[i];
      var address = entry.key;
      var value = entry.value;
      var xvalue = x.map.get(address);
      if (xvalue)
      {
        if (!value.equals(xvalue))
        {
//          else
//          {
            diff.push(address + ":\n\t" + value + " (" + value.fresh + ")\n\t" + xvalue + " (" + xvalue.fresh + ")");            
//          }
          if (value.aval.isBenv && xvalue.aval.isBenv)
          {
            diff.push(value.aval.diff(xvalue.aval))
          }
        }
      }
      else
      {
        diff.push(address + ":\n\t" + value + " (" + value.fresh + ")\n\t<undefined>");
      }
    }
    var xentries = x.map.entries();
    for (i = 0; i < xentries.length; i++)
    {
      xentry = xentries[i];
      address = xentry.key;
      xvalue = xentry.value;
      var value = this.map.get(address);
      if (!value)
      {
        diff.push(address + ":\n\t<undefined>\n\t" + xvalue + " (" + xvalue.fresh + ")");
      }
    }
    return diff.join("\n");
  }

Store.prototype.toString =
  function ()
  {
    var entries = this.map.entries();
    return "{" + entries.map(
      function (entry)
      {
        return entry.key + " =" + entry.value.fresh + "=> " + entry.value;
      }).join(",") + "}";
  }

Store.prototype.nice =
  function ()
  {
  var entries = this.map.entries();
    return "\n{\n" + entries.map(
      function (entry)
      {
        return entry.key + " =" + entry.value.fresh + "=> " + entry.value;
      }).join("\n") + "\n}";
  }

Store.prototype.lookupAval =
  function (address)
  {
    var value = this.map.get(address);
    if (value)
    {
      return value.aval;
    }
    throw new Error("Store.lookupAval: no abstract value for address " + address + "\n" + this.nice());
  };
  
Store.prototype.allocAval =
  function (address, aval, undef)
  {
    assertDefinedNotNull(address);
    assertDefinedNotNull(aval);
    var value = this.map.get(address);
    if (value && value.fresh !== 0)
    {
      var weaklyUpdatedValue = value.weakUpdate(aval);
//        print("REALLOCATED", address, weaklyUpdatedValue);
      var store = new Store(this.map.put(address, weaklyUpdatedValue)); 
      return store;
    }
    var newValue = new StoreValue(aval);
//      print("ALLOCATED", address, newValue);
    return new Store(this.map.put(address, newValue));
  };
    
//Store.prototype.allocAval2 = // DEBUG
//  function (address, aval, undef)
//  {
//    assertDefinedNotNull(address);
//    assertDefinedNotNull(aval);
//    var value = this.map.get(address);
//    if (value && value.fresh !== 0)
//    {
//      print("existing non-fresh", value.aval, value.aval.parentas);
//      print("joining with", aval, aval.parentas);
//      var weaklyUpdatedValue = value.weakUpdate(aval);
//      print("REALLOCATED", address, weaklyUpdatedValue.aval, weaklyUpdatedValue.aval.parentas);
//      var store = new Store(this.map.put(address, weaklyUpdatedValue)); 
//      return store;
//    }
//    var newValue = new StoreValue(aval);
//        print("ALLOCATED", address, newValue);
//    return new Store(this.map.put(address, newValue));
//  };
      
Store.prototype.updateAval =
  function (address, aval, msg)
  {
    var value = this.map.get(address);
    if (value)
    {
      var updatedValue = value.update(aval);
//      print("UPDATED", address, updatedValue);
      return new Store(this.map.put(address, updatedValue));
    }
    throw new Error("Store.updateAval: no abstract value at address " + address);
  };
  
Store.prototype.join =
  function (store)
  {
    return new Store(this.map.join(result.map));
  }

Store.prototype.narrow =
  function (addresses)
  {
    return new Store(this.map.narrow(addresses));
  }

Store.prototype.keys =
  function ()
  {
    return this.map.keys();
  }

Store.prototype.toJSON =
  function ()
  {
    return this.map.toJSON();
  }