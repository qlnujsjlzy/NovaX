/**
 * Created by wangzheng on 16/4/22.
 */
function ItemObject(item){
    //this.oid = "wz_init_"+Math.uidFast();  //oid只有初始化数据 setData的时候才会有,是用于判断增删改Items的重要依据
    kendo.data.ObservableObject.apply(this, [item]);
}
ItemObject.prototype = new kendo.data.ObservableObject();
