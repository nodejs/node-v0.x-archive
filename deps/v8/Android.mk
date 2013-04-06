LOCAL_PATH := $(call my-dir)

# libv8.so
# ===================================================
include $(CLEAR_VARS)

LOCAL_MODULE := libv8
LOCAL_SRC_FILES := out/android_arm.debug/lib.target/libv8.so
LOCAL_EXPORT_C_INCLUDES := $(LOCAL_PATH)/include

include $(PREBUILT_SHARED_LIBRARY)
