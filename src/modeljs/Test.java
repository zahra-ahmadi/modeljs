package modeljs;

import java.io.FileReader;
import java.util.List;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import jdk.nashorn.api.scripting.JSObject;
import jdk.nashorn.api.scripting.ScriptObjectMirror;
import jdk.nashorn.api.scripting.ScriptUtils;
import jdk.nashorn.internal.objects.NativeArray;

public class Test
{
	private static ScriptObjectMirror[] convertArray(JSObject jsarray)
	{
		if (!jsarray.isArray())
		{
			throw new RuntimeException("not an array");
		}
		int length = ((Long) jsarray.getMember("length")).intValue();
		ScriptObjectMirror[] result = new ScriptObjectMirror[(int)length];
		for (int i = 0; i < length; i++)
		{
			result[i] = (ScriptObjectMirror) jsarray.getSlot(i);
		}
		return result;
	}
	
	public static void main(String... args) throws Throwable
	{
		ScriptEngineManager engineManager = new ScriptEngineManager();
		ScriptEngine engine = engineManager.getEngineByName("nashorn");
		engine.eval(new FileReader("build.js"));
		Invocable invocable = (Invocable) engine;
//		String ast = Files.toString(new File("test/resources/gcd.js"), Charset.defaultCharset());
		ScriptObjectMirror dsg = (ScriptObjectMirror) engine.eval("createGraph('2+3')");
		JSObject etg = (JSObject) dsg.getMember("etg");
		ScriptObjectMirror[] edges = (ScriptObjectMirror[]) convertArray((JSObject) invocable.invokeMethod(etg, "edges"));
		Object initial = dsg.getMember("initial");
		System.out.println(invocable.invokeMethod(initial, "toString"));
		ScriptObjectMirror[] outgoing = (ScriptObjectMirror[]) convertArray((JSObject) invocable.invokeMethod(etg, "outgoing", initial));
		for (JSObject edge : edges)
		{
			System.out.println(invocable.invokeMethod(edge, "toString"));
		}
		System.out.println("outgoing");
		for (JSObject edge : outgoing)
		{
			System.out.println(invocable.invokeMethod(edge, "toString"));
		}
	}
}
