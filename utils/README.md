# 找树

## 什么是树
树分为2种，深色橡树和非深色橡树。我们不考虑深色橡树的情况。

平地找树，在两格高的平面里搜索1\*1或2\*2（深色橡木）的树干，对于每棵树，确定一个“核心杆”。如果树干只有1\*1，
核心杆即为树干的中心轴。如果是2\*2的树干，核心杆为树干偏向xz较大的那个坐标所在的方块的中心轴。
如果树干为其他形状，则按各自为1\*1的树干来处理。

找到平面上的一个树干最下的一个木头，不断搜索3\*3方格里除了以外的所有格子，直到搜索不到，或方块距离核心杆半径超过了挖掘最远距离上限（6格）
这就是一棵树。 挖掉一棵树之后需要在中心轴上补种。

## 怎么找树
怎么找树？从地面1格的所有区域内方块找起、确定所有树的中心轴。在xy区域按照中心轴进行均匀划分。确定每个区域里的木头，就得到了树的分布。
