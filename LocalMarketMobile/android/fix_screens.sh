#!/bin/bash
cd /Users/vansh/ReactProject/LocalMarket/LocalMarketMobile/node_modules/react-native-screens/android/src/main/java/com/swmansion/rnscreens

find . -name "*.kt" -exec sed -i '' 's/override fun setStandardAppearance/fun setStandardAppearance/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setScrollEdgeAppearance/fun setScrollEdgeAppearance/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setTabBarItemBadgeBackgroundColor/fun setTabBarItemBadgeBackgroundColor/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setIconType/fun setIconType/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setIconImageSource/fun setIconImageSource/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setIconResourceName/fun setIconResourceName/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setSelectedIconImageSource/fun setSelectedIconImageSource/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setSelectedIconResourceName/fun setSelectedIconResourceName/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setIsFocused/fun setIsFocused/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setTabKey/fun setTabKey/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setBadgeValue/fun setBadgeValue/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setTitle/fun setTitle/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setIsTitleUndefined/fun setIsTitleUndefined/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setSpecialEffects/fun setSpecialEffects/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setOverrideScrollViewContentInsetAdjustmentBehavior/fun setOverrideScrollViewContentInsetAdjustmentBehavior/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setBottomScrollEdgeEffect/fun setBottomScrollEdgeEffect/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setLeftScrollEdgeEffect/fun setLeftScrollEdgeEffect/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setRightScrollEdgeEffect/fun setRightScrollEdgeEffect/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setTopScrollEdgeEffect/fun setTopScrollEdgeEffect/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setTabBarItemTestID/fun setTabBarItemTestID/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setTabBarItemAccessibilityLabel/fun setTabBarItemAccessibilityLabel/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setTabBarItemBadgeTextColor/fun setTabBarItemBadgeTextColor/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setDrawableIconResourceName/fun setDrawableIconResourceName/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setOrientation/fun setOrientation/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setSystemItem/fun setSystemItem/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setUserInterfaceStyle/fun setUserInterfaceStyle/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setImageIconResource/fun setImageIconResource/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setEdges/fun setEdges/g' {} +
find . -name "*.kt" -exec sed -i '' 's/override fun setInsetType/fun setInsetType/g' {} +

# Interface removals
find . -name "TabsScreenViewManager.kt" -exec sed -i '' 's/, RNSTabsScreenManagerInterface<TabsScreen>//g' {} +
find . -name "TabsScreenViewManager.kt" -exec sed -i '' 's/private val delegate:.*/\/\/ removed delegate/g' {} +

find . -name "SafeAreaViewManager.kt" -exec sed -i '' 's/, RNSSafeAreaViewManagerInterface<SafeAreaView>//g' {} +
find . -name "SafeAreaViewManager.kt" -exec sed -i '' 's/private val delegate:.*/\/\/ removed delegate/g' {} +

echo "Screens fixed"
