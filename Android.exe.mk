# Copyright (C) 2009 The Android Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
LOCAL_PATH      := $(call my-dir)

include $(CLEAR_VARS)
include $(LOCAL_PATH)/Android.common.mk

LOCAL_SHARED_LIBRARIES += \
	crypto \
	ssl \
	v8

LOCAL_STATIC_LIBRARIES := \
	cares \
	http_parser \
	uv \
	pty

LOCAL_LDFLAGS += -rdynamic \
	-lz \
	-llog

include $(BUILD_EXECUTABLE)

$(call import-module,deps/cares)
$(call import-module,deps/http_parser)
$(call import-module,deps/uv)
$(call import-module,deps/v8)
$(call import-module,pty)
$(call import-module,openssl-android)
